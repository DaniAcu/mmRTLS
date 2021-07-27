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

//Global Data
static const char *TAG = "scanner";
static wifi_handler_data_t wifi_data ;
QueueHandle_t scannerMessageQueue;

#define SCANNER_IS_PROBE_REQPACKET(fc)        ( ( (fc) & 0xFF00 ) == 0x4000 )


typedef struct scannerParams {
    uint8_t  channels;
    uint16_t timeBetweenChannels;
} scannerParams;

typedef struct {
	int16_t fctl;               /*frame control*/
	int16_t duration;           /*duration id*/
	uint8_t da[6];              /*receiver address*/
	uint8_t sa[6];              /*sender address*/
	uint8_t bssid[6];           /*filtering address*/
	int16_t seqctl;             /*sequence control*/
	unsigned char payload[];    /*network data*/
} __attribute__((packed)) wifi_mgmt_hdr;

//-- Event Handlers start --
void wifiScannerPacketHandler(void *buffer, wifi_promiscuous_pkt_type_t type)
{
    int fc, index;
    wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buffer;
    wifi_mgmt_hdr *mgmt = (wifi_mgmt_hdr *)pkt->payload;
    fc = ntohs( mgmt->fctl );
   
    if (type == 0) {
        rssiData_t rssiData = processWifiPacket(&(pkt->rx_ctrl),  pkt->payload);
        if (rssiData.isValid) {
            xQueueSend( scannerMessageQueue, &rssiData, portMAX_DELAY );
        }

        if ( ( index = wifiHandlerGetAPIndexFromListbyMAC( rssiData.mac ) ) > 0 ) { 
            if( SCANNER_IS_PROBE_REQPACKET(fc) ) {
                uint8_t ssid_len;
                ssid_len = pkt->payload[ 25 ];
                if( ssid_len > 0 ){
                    wifiHandlerAPCredentialListInsertSSDI( index, (char*)&pkt->payload[ 25 ], ssid_len, rssiData.rssi  );
                }
            }             
        }
    }
}

//Task
void scannerTask(void *pvParameter) {
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

    xTaskCreate(&scannerTask, "scannerTask", 2048, &params, 3, NULL);

    return ESP_OK;
}

void Wifi_PrintDebug(const char *log) {
    #if (1  == WIFI_VERBOSE )
        printf(log);
    #endif
}
