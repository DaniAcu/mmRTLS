#include "utils.h"


/*============================================================================*/
char *utilsMAC2str( uint8_t *mac_addr, char *dst, size_t ndst )
{
    char *retRef = NULL;
    if ( ( NULL != mac_addr) && ( NULL != dst ) && ( ndst >= 18 ) ) {
        snprintf( dst, ndst, "%02X:%02X:%02X:%02X:%02X:%02X", mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5] );
        retRef = dst;
    }
    return retRef;
}
/*============================================================================*/
int utils_str2MAC( char *s, uint8_t *dst )
{
    int retval = -1;
    if ( strlen(s) >= 17 ) {
        size_t i = 0;
        char *ptr = s - 1;
        do {
            dst[ i++ ] = (uint8_t)strtoul( ptr+1, NULL, 16 );
            ptr = strchr( ptr+1, ':' );
        } while ( ( NULL !=  ptr ) && ( i < 6 ) );
        retval = ( i == 6 )? 0 : -1;
    }
    return retval;
}
/*============================================================================*/