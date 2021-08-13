#include "wifiConfig.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"

#include "scanner.h"

#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_event.h"
#include "nvs_flash.h"

#include "packetProcessor.h"
#include "wifiHandler.h"
#include "sntpUpdate.h"
#include <string.h>

#include "ieee80211_structs.h"

//Global Data
static const char *TAG = "scanner";
static wifi_handler_data_t wifi_data ;
QueueHandle_t scannerMessageQueue;


typedef struct scannerParams {
    uint8_t  channels;
    uint16_t timeBetweenChannels;
} scannerParams;

#if ( WIFI_USE_ROAMING == 1 )
static char* wifiScannerGetSSIDFromPacket( wifi_promiscuous_pkt_t* pkt, char *dst );
#endif
//-- Event Handlers start --

void wifiScannerPacketHandler(void *buffer, wifi_promiscuous_pkt_type_t type)
{
    #if ( WIFI_USE_ROAMING == 1 )
    int index;
    #endif
    wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buffer; /* First layer: type cast the received buffer into our generic SDK structure*/
   
    if( WIFI_PKT_MGMT == type ) {
        rssiData_t rssiData = processWifiPacket(&(pkt->rx_ctrl),  pkt->payload);
        if (rssiData.isValid) {
            xQueueSend( scannerMessageQueue, &rssiData, portMAX_DELAY );
        }
        #if ( WIFI_USE_ROAMING == 1 )
        if ( ( index = wifiHandlerGetAPIndexFromListbyMAC( rssiData.mac ) ) > 0 ) { 
            char ssid[ MAX_SSID_NAME_LENGTH ]= { 0 };
            if( NULL != wifiScannerGetSSIDFromPacket( pkt, ssid ) ){
                wifiHandlerAPCredentialListInsertSSDI( index, ssid, rssiData.rssi  );
            }          
        }
        #endif
    }
}

#if ( WIFI_USE_ROAMING == 1 )
static char* wifiScannerGetSSIDFromPacket( wifi_promiscuous_pkt_t* pkt, char *dst )
{
    char *retVal = NULL;
    const wifi_ieee80211_packet_t *ipkt = (wifi_ieee80211_packet_t *)pkt->payload;  /* Second layer: define pointer to where the actual 802.11 packet is within the structure*/
    const wifi_ieee80211_mac_hdr_t *hdr = &ipkt->hdr;  /* Third layer: define pointers to the 802.11 packet header and payload*/
    const wifi_header_frame_control_t *frame_ctrl = (wifi_header_frame_control_t *)&hdr->frame_ctrl;   /*Pointer to the frame control section within the packet header*/ 

    if (frame_ctrl->type == WIFI_PKT_MGMT && frame_ctrl->subtype == BEACON){
        const wifi_mgmt_beacon_t *beacon_frame = (wifi_mgmt_beacon_t*) ipkt->payload;  
        strncpy( dst, beacon_frame->ssid, (beacon_frame->tag_length >= 32 )? 31 : beacon_frame->tag_length );
        retVal = dst;
    }
    return retVal;
}
#endif

//Task
void scannerTask(void *pvParameter) 
{
    EventBits_t xBits;
    scannerParams *params = (scannerParams *) pvParameter;
    uint8_t channel = params->channels;
  
    ESP_LOGI( TAG, "Started, Waiting wifi module to be ready" );
    xEventGroupWaitBits(wifi_data.eventGroup, WIFI_READY, false, true, portMAX_DELAY);
    
    ESP_LOGI( TAG, "Wifi module ready");
    wifiHandlerScanMode(true);
  
    for (;;) {      
        xBits = xEventGroupWaitBits(wifi_data.eventGroup,  WIFI_SCAN_START | WIFI_DISCONNECTED , false, true, portMAX_DELAY);
    
        if (xBits & WIFI_SCAN_START) {
            if (++channel >= params->channels) {
                channel = 1;       
            }
            ESP_LOGI( TAG, "Scanning Channel %d of %d, %d mseg", channel, params->channels, params->timeBetweenChannels) ;
            wifiHandlerSaveChannel(channel);
            wifihandlerSetChannel(channel);
        } 
        vTaskDelay(params->timeBetweenChannels / portTICK_RATE_MS);    
    }
}

//Exposed API
int32_t wifiScannerStart(uint8_t nChannels, uint16_t timeBetweenChannels, QueueHandle_t messageQueue, EventGroupHandle_t eventGroup)
{
    if (eventGroup == NULL) {
        ESP_LOGE( TAG, "wifiScannerStart: eventGroup can be null" );
        return ESP_ERR_INVALID_ARG;
    }

    wifi_data.eventGroup = eventGroup;
    if (nChannels >= WIFI_CHANNEL_MAX) {
        nChannels = WIFI_CHANNEL_MAX;
    }

    static scannerParams params;
    params.channels = nChannels;
    params.timeBetweenChannels = timeBetweenChannels;
    scannerMessageQueue = messageQueue;

    processKnownListLoad();
    xTaskCreate(&scannerTask, "scannerTask", 2048, &params, 3, NULL);

    return ESP_OK;
}

void Wifi_PrintDebug(const char *log) 
{
    #if (1  == WIFI_VERBOSE )
        printf(log);
    #endif
}
