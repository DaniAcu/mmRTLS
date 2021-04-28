#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "freertos/Queue.h"

#include "scanner.h"

#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_event.h"
#include "nvs_flash.h"

#include "packetProcessor.h"

//Global Data
static EventGroupHandle_t wifi_event_group;
static const int START_BIT = BIT0;
QueueHandle_t scannerMessageQueue;

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

static void wifiEventhandler(void* arg, esp_event_base_t event_base,  int32_t event_id, void* event_data)
{
  //Wifi module has properly Started
  if (event_id == WIFI_EVENT_STA_START) {
        xEventGroupSetBits(wifi_event_group, START_BIT);
  }
}
//-- Event Handlers end --

// -- Internal Functions start --
void wifiScannerSetChannel(uint8_t channel)
{
  esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
}

void wifiScannerInit(char channels)
{
  nvs_flash_init();
  tcpip_adapter_init();
  ESP_ERROR_CHECK(esp_event_loop_create_default());

  wifi_event_group = xEventGroupCreate();

  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  ESP_ERROR_CHECK( esp_wifi_init(&cfg) );
  ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifiEventhandler, NULL));

  wifi_country_t wificountry = {
    .cc = "CN",
    .schan = 1,
    .nchan = channels
  };
  
  ESP_ERROR_CHECK(esp_wifi_set_country(&wificountry));
  ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM))
  ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
  ESP_ERROR_CHECK(esp_wifi_start());
}
// -- Internal Functions end --


typedef struct scannerParams {
    char  channels;
    int   timeBetweenChannels;
} scannerParams;

//Task
void scannerTask(void *pvParameter)
{
    printf("scannerTask Started\n");
    scannerParams *params = (scannerParams *) pvParameter;

    printf("Waiting Wifi Module to Start\n");
    xEventGroupWaitBits(wifi_event_group, START_BIT, false, true, portMAX_DELAY);
    printf("Wifi Module Started, configuring promiscuous mode\n");
    
    ESP_ERROR_CHECK(esp_wifi_set_promiscuous_rx_cb(&wifiScannerPacketHandler));
    
    wifi_promiscuous_filter_t snifferFilter = {0};
    // Filter data and mgmt packets, only interested in the control ones (WIFI_PROMIS_FILTER_MASK_CTRL)
    snifferFilter.filter_mask = WIFI_PROMIS_FILTER_MASK_DATA | WIFI_PROMIS_FILTER_MASK_MGMT;
    
    if (snifferFilter.filter_mask != 0) {
      ESP_ERROR_CHECK(esp_wifi_set_promiscuous_filter(&snifferFilter));
    }

    ESP_ERROR_CHECK(esp_wifi_set_promiscuous(true));
    char channel = 1;

    for (;;) {
        printf("Scanning Channel %d, %d mseg\n", channel, params->timeBetweenChannels);
        wifiScannerSetChannel(channel);

        vTaskDelay(params->timeBetweenChannels / portTICK_RATE_MS);

        if (++channel > params->channels) {
          channel = 1;
        }
    }
}

//Exposed API
int32_t startScanner(char channels, unsigned int timeBetweenChannels, QueueHandle_t messageQueue)
{
    if (channels >= MAX_WIFI_CHANNELS) {
      channels = MAX_WIFI_CHANNELS;
    }

    wifiScannerInit(channels);

    static scannerParams params;
    params.channels = channels;
    params.timeBetweenChannels = timeBetweenChannels;
    scannerMessageQueue = messageQueue;

    xTaskCreate(&scannerTask, "scannerTask", 2048, &params, 3, NULL);

    return ESP_OK;
}