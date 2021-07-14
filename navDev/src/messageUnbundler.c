#include "messageUnbundler.h"
#include "utils.h"
#include "packetProcessor.h"

typedef bool (*forEachOperation_t)( char *item, size_t index, void *xData );
typedef void (*initOperation_t)( void *xData );
typedef void (*endOperation_t)( void *xData );

static void messageUnbundlerArrayOperationCleanKnownList( void *nlist );
static bool messageUnbundlerArrayOperationGetKnownNodes( char *item, size_t index, void *nlist );
static int messageUnbundlerParseArray( char *json_s, char *identifier, initOperation_t initFcm, forEachOperation_t iOperation, endOperation_t endFcn, void *xData );

/*============================================================================*/
static void messageUnbundlerArrayOperationCleanKnownList( void *nlist )
{
    uint8_t *knownList = (uint8_t*)nlist;
    printf( "[messageUnbundler] :] Clear the list before getting the new one\r\n" );
    memset( knownList, 0, MAXKNOWN_NODES_LIST_SIZE );
}
/*============================================================================*/
static bool messageUnbundlerArrayOperationGetKnownNodes( char *item, size_t index, void *nlist )
{
    uint8_t imac[6] = {0};
    uint8_t *knownList = (uint8_t*)nlist;
    
    printf( "[%d]: %s \r\n", index, item );
    utils_str2MAC( item, imac );
    memcpy( &knownList[index*6], imac, sizeof(imac) );
    return false;
}
/*============================================================================*/
static int messageUnbundlerParseArray( char *json_s, char *identifier, initOperation_t initFcm, forEachOperation_t iOperation, endOperation_t endFcn, void *xData )
{
    cJSON *incoming_json = cJSON_Parse( json_s );
    int status = 0;

    if ( NULL == incoming_json ) {
        printf("[messageUnbundler] :] ERROR PARSING\r\n");
        status = -1;
    }
    else {
        const cJSON *arr = NULL;
        const cJSON *item = NULL;
        arr = cJSON_GetObjectItemCaseSensitive( incoming_json, identifier );
        size_t i = 0;
        if ( NULL !=  initFcm ) {
            initFcm( xData );
        }
        if ( NULL != iOperation ) {
            cJSON_ArrayForEach( item, arr){
                char *itemstr = cJSON_GetStringValue( item );
                iOperation( itemstr, i++, xData );
            }
        }
        if ( NULL !=  endFcn ) {
            endFcn( xData );
        }
        status = (int )i;
    }   
    cJSON_Delete( incoming_json );
    return status;
}
/*============================================================================*/
int messageUnbundlerRetrieveKnownNodes( char *incoming ){
    messageUnbundlerParseArray( incoming, "beacons",  
                                messageUnbundlerArrayOperationCleanKnownList, 
                                messageUnbundlerArrayOperationGetKnownNodes, 
                                NULL,  
                                processGetListOfKnown() ); 
    return 0;
}
/*============================================================================*/

