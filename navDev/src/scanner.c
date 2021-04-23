#include "scanner.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"

#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"

//Global Data
static EventGroupHandle_t wifi_event_group;
static const int START_BIT = BIT0;

//-- Event Handlers start --
void wifiScannerPacketHandler(void* buff, wifi_promiscuous_pkt_type_t type)
{
  printf("wifiScannerPacketHandler\n");
  //TODO: packet analysis
}

static void wifiEventhandler(void* arg, esp_event_base_t event_base,  int32_t event_id, void* event_data)
{
  printf("wifiEventhandler\n");
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

void wifiScannerInit(void)
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
    .nchan = 14, //TBD: less channels means less hopping and lose packets
  };
  
  ESP_ERROR_CHECK(esp_wifi_set_country(&wificountry));
  ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM))
  ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_NULL)); // WIFI_MODE_STA, WIFI_MODE_NULL
  ESP_ERROR_CHECK(esp_wifi_start());
}
// -- Internal Functions end --


//Task
void scannerTask(void *pvParameter)
{
    printf("scannerTask Started\n");

    printf("Waiting Wifi Module to Start\n");
    xEventGroupWaitBits(wifi_event_group, START_BIT, false, true, portMAX_DELAY);
    printf("Wifi Module Started, configuring promiscuous mode\n");
    
    wifiScannerSetChannel(ROUTER_CHANNEL);
    ESP_ERROR_CHECK(esp_wifi_set_promiscuous_rx_cb(&wifiScannerPacketHandler));
    
    //TODO: Check filters options for less packet processsing
    wifi_promiscuous_filter_t snifferFilter = {0};
    //snifferFilter.filter_mask |= WIFI_PROMIS_FILTER_MASK_MGMT;
    //snifferFilter.filter_mask |= WIFI_PROMIS_FILTER_MASK_CTRL;
    //snifferFilter.filter_mask |= WIFI_PROMIS_FILTER_MASK_DATA;
    
    if (snifferFilter.filter_mask != 0) {
      ESP_ERROR_CHECK(esp_wifi_set_promiscuous_filter(&snifferFilter));
    }

    ESP_ERROR_CHECK(esp_wifi_set_promiscuous(true));

    for (;;) {
        printf("Scanning..\n");
        // We should change channels ...
        // channel = (channel % WIFI_CHANNEL_MAX) + 1;
        // void wifiScannerSetChannel(channel)
        vTaskDelay(500 / portTICK_RATE_MS);
    }
}

//Exposed API
int32_t startScanner(void)
{
    wifiScannerInit();
    xTaskCreate(&scannerTask, "scannerTask", 2048, NULL, 4, NULL);

    return ESP_OK;
}