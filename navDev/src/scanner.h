#ifndef  SCANNER_H
#define  SCANNER_H

#ifdef __cplusplus
extern "C" {
#endif

    #include <stdint.h>
    #include "freertos/FreeRTOS.h"
    #include "freertos/event_groups.h"
    #include "freertos/queue.h"
    #include "esp_wifi.h"

    enum {
        WIFI_COUNTRY_CN = 0, /**< country China, channel range [1, 14] */
        WIFI_COUNTRY_JP,     /**< country Japan, channel range [1, 14] */
        WIFI_COUNTRY_US,     /**< country USA, channel range [1, 11] */
        WIFI_COUNTRY_EU,     /**< country Europe, channel range [1, 13] */
        WIFI_COUNTRY_MAX
    };

    void wifiScannerPacketHandler( void *buffer, wifi_promiscuous_pkt_type_t type );
    int32_t wifiScannerStart( uint8_t nChannels, uint16_t timeBetweenChannels, QueueHandle_t messageQueue,EventGroupHandle_t eventGroup );

#ifdef __cplusplus
}
#endif

#endif //SCANNER_H
