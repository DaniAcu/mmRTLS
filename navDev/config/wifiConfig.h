#ifndef __WIFI_CONFIG_H
#define __WIFI_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif

    #define CONFIG_WIFI_RECONNECT_TRIES         ( 5 )  
    #define CONFIG_WIFI_RSSIDATA_QUEUE_SIZE     ( 16 )
    #define CONFIG_WIFI_CHANNEL_MAX             ( 14 )
    #define CONFIG_WIFI_SCAN_TIME_MS_BTW_CH     ( 100 )
    #define CONFIG_MAX_SSID_NAME_LENGTH         ( 32 )
    #define CONFIG_MAX_CRED_PWD_LENGTH          ( 64 )
    #define CONFIG_MAX_ENTRIES_ON_AP_CRED_LIST  ( 32 )
    #define CONFIG_WIFI_USE_ROAMING             ( 1 )
    #define CONFIG_WIFI_PERSISTENT_CREDENTIALS  ( 1 )
    #define CONFIG_WIFI_RETRY_MAX               ( 5 )

    //#define CONFIG_WIFI_DEFAULT_SSID            "DEFAULT_AP_SSID"
    //#define CONFIG_WIFI_DEFAULT_PASS            "DEFAULT_AP_PASS"

    #ifndef CONFIG_WIFI_DEFAULT_SSID
        #error Set the default Access Point SSID in CONFIG_WIFI_DEFAULT_SSID
    #endif 
    #ifndef CONFIG_WIFI_DEFAULT_PASS
        #error Set the default Access Point password in CONFIG_WIFI_DEFAULT_PASS
    #endif 

#ifdef __cplusplus
}
#endif 
#endif/*__WIFI_CONFIG_H*/