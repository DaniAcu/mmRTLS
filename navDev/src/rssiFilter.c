#include "rssiFilter.h"

static int8_t rssiFilter_LPF1( rssiFilter_t *f, int8_t s );
static int8_t rssiFilter_LPF2( rssiFilter_t *f, int8_t s );
static int8_t rssiFilter_RMOW( rssiFilter_t *f, int8_t s );


/*============================================================================*/
int rssiFilterIsInitialized( rssiFilter_t *f )
{
    int retVal = 0;
    if ( NULL != f ) {
        return ( ( NULL != f->filtFcn ) && ( RSSI_FILTER_MODE_NONE != f->mode ) );
    }    
    return retVal;
} 
/*============================================================================*/
void rssiFilterReset( rssiFilter_t *f ) 
{
    if ( NULL != f ) {
        f->init = 1u;
    }
}
/*============================================================================*/
static int8_t rssiFilter_LPF1( rssiFilter_t *f, int8_t s ) 
{
    float u, fo;
    
    u = (float)s;
    
    if ( f->init ) {
        f->fo_1 = u;
        f->init = 0u;
    }
    fo = ( 1.0f - f->alfa )*u + f->alfa*f->fo_1;
    f->fo_1 = fo;    
    
    return (int8_t)fo;
}
/*============================================================================*/
static int8_t rssiFilter_LPF2( rssiFilter_t *f, int8_t s ) 
{
    float u, fo;
    
    u = (float)s;
    
    if ( f->init ) {
        f->fo_1 = u;
        f->fo_2 = u;
        f->u_1 = u;
        f->u_2 = u;
        f->init = 0u;
    }        
    fo = f->k*u + f->b1*f->u_1 + f->k*f->u_2 - f->a1*f->fo_1 - f->a2*f->fo_2;
    f->u_2 = f->u_1;
    f->u_1 = u;
    f->fo_2 = f->fo_1;
    f->fo_1 = fo;    
    
    return (int8_t)fo;
}
/*============================================================================*/
static int8_t rssiFilter_RMOW( rssiFilter_t *f, int8_t s )
{
    int i, m, fo;
    
    if ( f->init ) {
        for( i = 0; i< RSSI_FILTER_WINDOW_SIZE; i++ ){
            f->w[ i ] = s;
        }
        f->m = s; 
        f->init = 0u;
    }
            
    m = 0;
    for ( i = (RSSI_FILTER_WINDOW_SIZE-1); i >= 1 ; --i ) { 
        f->w[ i ] = f->w[ i-1 ]; /*shift the window*/
        m += f->w[ i ]; /*sum old samples*/
    }
        
    f->w[ 0 ] = s; 
    if ( abs( f->m - s )  > (int)( f->alfa*abs( f->m ) ) ) { /*is it an outlier?*/
        f->w[ 0 ] = (int8_t)f->m; /*replace the outlier with the dynamic median*/
    }
    f->m = (int8_t)( ( m + f->w[ 0 ] ) / RSSI_FILTER_WINDOW_SIZE );  /*compute new mean for next iteration*/
    fo = f->w[ 0 ]; 
    
    return (int8_t)fo;
}
/*============================================================================*/
int rssiFilterInit( rssiFilter_t *f , rssiFilterMode_t mode, float alfa )
{
    int retVal = 0;
    
    if ( ( NULL != f ) && ( alfa > 0.0f ) && ( alfa < 1.0f ) ) {
        f->alfa = alfa;
        f->mode = mode;
        rssiFilterReset( f );
        
        switch ( mode ) {
            case RSSI_FILTER_MODE_LPF1:
                f->filtFcn = &rssiFilter_LPF1;
                f->alfa = alfa;
                break;
            case RSSI_FILTER_MODE_LPF2:
                {
                    float aa, p1, c;
                    f->alfa = alfa;
                    aa = alfa*alfa;
                    p1 = sqrtf( 2.0f*alfa );
                    c = 1.0 + p1 + aa;
                    f->k = aa/c;
                    f->a1 = 2.0f*( aa - 1.0f )/c;
                    f->a2 = ( 1.0f - p1 + aa )/c;
                    f->b1 = 2.0*f->k;
                }
                f->filtFcn = &rssiFilter_LPF2;
                break;
            case RSSI_FILTER_MODE_RMOW:
                f->alfa = 1.0f - alfa; /*normalize alfa*/
                f->filtFcn = &rssiFilter_RMOW;
                break;
            default:
                f->filtFcn = NULL;
                break;
        }
        retVal = 1;
    }
    return retVal;
}   
/*============================================================================*/
int8_t rssiFilterPerform( rssiFilter_t *f, int8_t s )
{
    int8_t out = s;
    if ( NULL != f ) {
        if ( NULL != f->filtFcn ) {
            out = f->filtFcn( f, s );
        }
    }
    return out;
}
/*============================================================================*/