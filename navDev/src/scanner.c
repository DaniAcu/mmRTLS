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

//Global Data
static wifi_handler_data_t wifi_data ;
QueueHandle_t scannerMessageQueue;


typedef struct scannerParams {
    uint8_t  channels;
    uint16_t timeBetweenChannels;
} scannerParams;


//-- Event Handlers start --
void wifiScannerPacketHandler(void *buffer, wifi_promiscuous_pkt_type_t type)
{
    wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buffer;
   
    if (type == 0) {
        rssiData_t rssiData = processWifiPacket(&(pkt->rx_ctrl),  pkt->payload);
        if (rssiData.isValid) {
            xQueueSend( scannerMessageQueue, &rssiData, portMAX_DELAY );
        }
    }
}

//Task
void scannerTask(void *pvParameter) {
    EventBits_t xBits;
    scannerParams *params = (scannerParams *) pvParameter;
    uint8_t channel = params->channels;
  
    printf("[scannerTask] Started, Waiting wifi module to be ready\n");
    xEventGroupWaitBits(wifi_data.eventGroup, WIFI_READY, false, true, portMAX_DELAY);
    
    printf("[scannerTask] Wifi module ready\n");
    wifiHandlerScanMode(true);
  
    for (;;) {      
        xBits = xEventGroupWaitBits(wifi_data.eventGroup,  WIFI_SCAN_START | WIFI_DISCONNECTED , false, true, portMAX_DELAY);
    
        if (xBits & WIFI_SCAN_START) {
            if (++channel >= params->channels) {
                channel = 1;       
            }
            printf("Scanning Channel %d of %d, %d mseg\n", channel, params->channels, params->timeBetweenChannels);
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
        printf("wifiScannerStart: eventGroup can be null \n");
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
