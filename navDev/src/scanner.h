#ifndef  SCANNER_H
#define  SCANNER_H
#include <stdint.h>
#include "freertos/FreeRTOS.h"
#include "freertos/Queue.h"

#define MAX_WIFI_CHANNELS   14

enum 
{
    WIFI_COUNTRY_CN = 0, /**< country China, channel range [1, 14] */
    WIFI_COUNTRY_JP,     /**< country Japan, channel range [1, 14] */
    WIFI_COUNTRY_US,     /**< country USA, channel range [1, 11] */
    WIFI_COUNTRY_EU,     /**< country Europe, channel range [1, 13] */
    WIFI_COUNTRY_MAX
};

int32_t startScanner(char channels, unsigned int timeBetweenChannels, QueueHandle_t messageQueue);

#endif //SCANNER_H
