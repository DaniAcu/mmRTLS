
#ifndef __CTRL_HANDLER_H
#define __CTRL_HANDLER_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_event.h"
#include "esp_log.h"
#include "freertos/event_groups.h"


#include "wifiConfig.h"

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

typedef struct{
    bool valid;
    char ssid[ MAX_SSID_NAME_LENGTH ];
    char pwd[ MAX_CRED_PWD_LENGTH];
    uint8_t macaddr[6];
    int8_t rssi;
}wifi_handler_ap_credentials_t;

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


wifi_handler_ap_credentials_t* wifiHandlerGetAPCredentialList( void );
int wifiHandlerGetAPIndexFromListbyMAC( uint8_t *mac2find );
int wifiHandlerAPCredentialListInsertSSDI( int index, char *ssid, uint8_t ssid_len, int8_t ap_rssid );
int wifiHandlerSetBestAPbyList( void );

#ifdef __cplusplus
}
#endif





#endif /*__CTL_HANDLER_H*/