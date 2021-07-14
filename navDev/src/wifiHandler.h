
#ifndef __CTRL_HANDLER_H
#define __CTRL_HANDLER_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_event.h"


typedef struct {
    EventGroupHandle_t eventGroup;  /* FreeRTOS event group to signal when we are connected*/
    wifi_promiscuous_cb_t packetHandler;
    uint8_t nChannels;
}wifi_handler_data_t;


typedef enum{
    WIFI_READY              = BIT0,
    WIFI_DISCONNECTED       = BIT1,
    WIFI_CONNECTING         = BIT2,
    WIFI_CONNECTED          = BIT3,
    WIFI_CONN_FAILED        = BIT4,
    WIFI_SCAN_START         = BIT5,
    WIFI_SCAN_STOP          = BIT6
} wifi_handler_event_bits_t;



/**
 * @brief
 */
int32_t wifiHandlerStart(uint8_t channels,wifi_promiscuous_cb_t wifiPacketHandler);

/**
 * @brief
 */
int32_t wifiHandlerScanMode(bool enabled);

/**
 * @brief
 */
void wifihandlerSetChannel(uint8_t channel);

/**
 * @brief
 */
void wifiHandlerSaveChannel(uint8_t currentChan);

/**
 * @brief
 */
uint8_t wifiHandlerGetSavedChannel(void);

/**
 * @brief
 */
EventGroupHandle_t wifiHandlerGetEventGroup(void);

/**
 * @brief
 */
int32_t wifiHandlerCheckAp(void);


/**
 * @brief 
*/
int32_t wifiHandlerGetStatusConnection(void);


/**
 * @brief
*/
void wifiHandlerAPTask( void* taskParmPtr );



#ifdef __cplusplus
}
#endif





#endif /*__CTL_HANDLER_H*/