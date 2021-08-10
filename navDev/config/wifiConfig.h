#ifndef __WIFI_CONFIG_H
#define __WIFI_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif

extern void Wifi_PrintDebug(const char *log);

#define WIFI_RECONNECT_TRIES        ( 5 )  
#define WIFI_RSSIDATA_QUEUE_SIZE    ( 16 )
#define WIFI_CHANNEL_MAX            ( 14 )
#define WIFI_SCAN_TIME_MS_BTW_CH    ( 500 )
#define MAX_SSID_NAME_LENGTH        ( 32 )
#define MAX_CRED_PWD_LENGTH         ( 64 )
#define MAX_ENTRIES_ON_AP_CRED_LIST ( 32 )
#define WIFI_VERBOSE                ( 1 )
#define WIFI_USE_ROAMING            ( 1 )
#define WIFI_PERSISTENT_CREDENTIALS ( 1 )

/*=====================Default AP =========================*/
//#define WIFI_SSID                   "Paula"  // test_ pasar a flash
//#define WIFI_PASS                   "1128424867" // test_ pasar a flash
#define WIFI_RETRY_MAX              ( 5 )


#ifndef WIFI_SSID
    #error Set the Access Point SSID in WIFI_SSID
#endif 
#ifndef WIFI_PASS
    #error Set the Access Point password in WIFI_PASS
#endif 


#ifdef __cplusplus
}
#endif 
#endif/*__WIFI_CONFIG_H*/