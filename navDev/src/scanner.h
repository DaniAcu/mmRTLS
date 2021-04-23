#ifndef  SCANNER_H
#define  SCANNER_H
#include <stdint.h>


#define ROUTER_CHANNEL  1

enum 
{
    WIFI_COUNTRY_CN = 0, /**< country China, channel range [1, 14] */
    WIFI_COUNTRY_JP,     /**< country Japan, channel range [1, 14] */
    WIFI_COUNTRY_US,     /**< country USA, channel range [1, 11] */
    WIFI_COUNTRY_EU,     /**< country Europe, channel range [1, 13] */
    WIFI_COUNTRY_MAX
};

int32_t startScanner(void);
#endif //SCANNER_H
