#ifndef __WIFI_CONFIG_H
#define __WIFI_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif

extern void Wifi_PrintDebug(const char *log);

#define WIFI_RECONNECT_TRIES        5  
#define WIFI_RSSIDATA_QUEUE_SIZE    16
#define WIFI_CHANNEL_MAX            14
#define WIFI_SCAN_TIME_MS_BTW_CH    1000

// #define TARGET_ESP32               
#define WIFI_VERBOSE                1

/*===================== AP =========================*/
#define WIFI_SSID                   "JulianAP"  // test_ pasar a flash
#define WIFI_PASS                   "isaac1234" // test_ pasar a flash
#define WIFI_RETRY_MAX              5



#ifdef __cplusplus
}
#endif 
#endif/*__WIFI_CONFIG_H*/