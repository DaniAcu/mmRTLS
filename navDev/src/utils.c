#include "utils.h"


/*============================================================================*/
char *utilsMAC2str( uint8_t *mac_addr, char *dst, size_t ndst )
{
    char *retRef = NULL;
    if( ( NULL != mac_addr) && ( NULL != dst ) && ( ndst >= 18 ) ){
        snprintf( dst, ndst, "%02X:%02X:%02X:%02X:%02X:%02X", mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5] );
        retRef = dst;
    }
    return retRef;
}
/*============================================================================*/