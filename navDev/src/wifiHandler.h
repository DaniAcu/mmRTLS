
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
    #include "ieee80211_structs.h"

    #include "wifiConfig.h"

    typedef struct 
    {
        EventGroupHandle_t eventGroup;  /* FreeRTOS event group to signal when we are connected*/
        wifi_promiscuous_cb_t packetHandler;
        uint8_t nChannels;
    } wifi_handler_data_t;

    typedef enum
    {
        WIFI_READY              = BIT0,
        WIFI_DISCONNECTED       = BIT1,
        WIFI_CONNECTING         = BIT2,
        WIFI_CONNECTED          = BIT3,
        WIFI_CONN_FAILED        = BIT4,
        WIFI_SCAN_START         = BIT5,
        WIFI_SCAN_STOP          = BIT6
    } wifi_handler_event_bits_t;

    typedef struct
    {
        uint8_t macaddr[ MAC_ADDR_LENGTH ];    
        char ssid[ CONFIG_MAX_SSID_NAME_LENGTH ];
        char pwd[ CONFIG_MAX_CRED_PWD_LENGTH ];
        int8_t rssi;
        bool valid;
    } wifi_handler_ap_credentials_t;

    int32_t wifiHandlerStart( uint8_t channels, wifi_promiscuous_cb_t wifiPacketHandler );
    void wifihandlerSetChannel( uint8_t channel );
    int32_t wifiHandlerScanMode( bool enabled );
    void wifiHandlerSaveChannel( uint8_t currentChan );
    uint8_t wifiHandlerGetSavedChannel( void );
    EventGroupHandle_t wifiHandlerGetEventGroup( void );
    wifi_handler_ap_credentials_t* wifiHandlerGetAPCredentialList( void );
    int wifiHandlerGetAPIndexFromListbyMAC( uint8_t *mac2find );
    int wifiHandlerAPCredentialListInsertSSDI( int index, char *ssid, int8_t ap_rssid );
    int wifiHandlerSetBestAPbyList( void );
    int wifiHandlerAPCredentialListStore( wifi_handler_ap_credentials_t *list );
    int wifiHandlerAPCredentialListLoad( void );

#ifdef __cplusplus
}
#endif

#endif /*__CTL_HANDLER_H*/