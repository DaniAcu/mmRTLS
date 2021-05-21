#include "wifiConfig.h"

#include "stdint.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "lwip/err.h"
#include "lwip/sys.h"

#include "wifiHandler.h"
#include "esp_netif.h"

static const char *TAG = "wifi station";
static wifi_handler_data_t wifi_data;
static uint8_t lastChannel = 1;
/** 
 * wifi events 
 */
static void wifiEventhandler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) {
   if (event_base == WIFI_EVENT) {
      if (event_id == WIFI_EVENT_STA_DISCONNECTED) {
         ESP_LOGI(TAG, "[wifiEventhandler] WIFI_EVENT_STA_DISCONNECTED");
         xEventGroupSetBits(  wifi_data.eventGroup, WIFI_DISCONNECTED|WIFI_SCAN_STOP);
         xEventGroupClearBits(wifi_data.eventGroup, WIFI_CONNECTED|WIFI_CONNECTING);
         wifihandlerSetChannel(wifiHandlerGetSavedChannel());
      }else if (event_id == WIFI_EVENT_STA_START) {
         xEventGroupSetBits(wifi_data.eventGroup, WIFI_READY);
      }
   } else if (event_base == IP_EVENT) {
      if (event_id == IP_EVENT_STA_GOT_IP) {
         ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
         ESP_LOGI(TAG, "[wifiEventhandler] got ip:" IPSTR, IP2STR(&event->ip_info.ip));
         xEventGroupSetBits(wifi_data.eventGroup, WIFI_CONNECTED);
         xEventGroupClearBits(wifi_data.eventGroup, WIFI_DISCONNECTED|WIFI_CONNECTING);
      }
   }
}

static void  wifiHandlerInit(void) {
   esp_netif_init();
   ESP_ERROR_CHECK(esp_event_loop_create_default());
   wifi_data.eventGroup  = xEventGroupCreate();
   wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
   ESP_ERROR_CHECK( esp_wifi_init(&cfg) );

   #ifdef TARGET_ESP32
       esp_netif_create_default_wifi_sta();
       esp_event_handler_instance_t instance_any_id;
       esp_event_handler_instance_t instance_got_ip;
       ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifiEventhandler, NULL, &instance_any_id));
       ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifiEventhandler, NULL, &instance_got_ip));
   #else 
       ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifiEventhandler, NULL));  // deprecated
       ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifiEventhandler, NULL)); // deprecated
   #endif

   wifi_config_t wifi_config = {
      .sta = {
         .ssid = WIFI_SSID,
         .password = WIFI_PASS,
         .threshold.authmode = WIFI_AUTH_WPA2_PSK,
         .pmf_cfg = {
            .capable = true,
            .required = false
         },
      },
   };

   wifi_country_t wificountry = {
      .cc = "CN",
      .schan = 1,
      .nchan = wifi_data.nChannels
   };

   ESP_ERROR_CHECK(esp_wifi_set_country(&wificountry));
   ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
   ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
   ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config) );
   ESP_ERROR_CHECK(esp_wifi_start());
}

/**
 *  START CONFIG
 */
int32_t wifiHandlerStart(uint8_t nChannels, wifi_promiscuous_cb_t wifiPacketHandler) {
   wifi_data.nChannels = nChannels;
   wifi_data.packetHandler = wifiPacketHandler;
   wifiHandlerInit();
   
   printf("Wifi Module Started, configuring promiscuous mode\n");
   ESP_ERROR_CHECK(esp_wifi_set_promiscuous_rx_cb(wifi_data.packetHandler));
   wifi_promiscuous_filter_t snifferFilter = {0};
   snifferFilter.filter_mask = WIFI_PROMIS_FILTER_MASK_DATA | WIFI_PROMIS_FILTER_MASK_MGMT;
   if (snifferFilter.filter_mask != 0) {
      ESP_ERROR_CHECK(esp_wifi_set_promiscuous_filter(&snifferFilter));
   }
   
   xTaskCreate( wifiHandlerAPTask, (const char *)"wifiHandlerAPTask", configMINIMAL_STACK_SIZE*4, NULL, tskIDLE_PRIORITY+1, NULL);
   return ESP_OK;
}

void wifihandlerSetChannel(uint8_t channel) {
   esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
}

int32_t wifiHandlerScanMode(bool enabled) {
   xEventGroupClearBits(wifi_data.eventGroup, enabled ? WIFI_SCAN_STOP  : WIFI_SCAN_START);
   xEventGroupSetBits(  wifi_data.eventGroup, enabled ? WIFI_SCAN_START : WIFI_SCAN_STOP);   

   if( true == enabled ){
      xEventGroupWaitBits(wifi_data.eventGroup, WIFI_DISCONNECTED , false, true, portMAX_DELAY);
   }

   ESP_ERROR_CHECK(esp_wifi_set_promiscuous(enabled));

   return ESP_OK;
}

void wifiHandlerSaveChannel(uint8_t currentChan){
   lastChannel = currentChan;
}

uint8_t wifiHandlerGetSavedChannel(void){
   return lastChannel;
}

EventGroupHandle_t wifiHandlerGetEventGroup(void)
{
   return wifi_data.eventGroup;
}

int32_t wifiHandlercheckAp(void)
{
   return 1;
}

int32_t wifiHandler_getStatusConnection(void) 
{
   return 1;
}

/**
 * TASK 
*/
void wifiHandlerAPTask( void* taskParmPtr ) {
   uint8_t retryConCnt = 0;
   EventBits_t xBits;
   printf("[wifiHandlerAPTask] Started, Waiting wifi module to be ready\n");
   xBits = xEventGroupWaitBits(wifi_data.eventGroup, WIFI_READY, false, true, portMAX_DELAY);
   
   xEventGroupSetBits(wifi_data.eventGroup, WIFI_DISCONNECTED);
   
   printf("[wifiHandlerAPTask] Ready, Waiting connection mode\n");
   for (;;) {
      xBits = xEventGroupWaitBits(wifi_data.eventGroup,  WIFI_DISCONNECTED | WIFI_CONNECTED | WIFI_SCAN_START | WIFI_SCAN_STOP, false, false, portMAX_DELAY);
      
      if ((xBits & WIFI_DISCONNECTED) && !(xBits & WIFI_CONNECTING) && (xBits & WIFI_SCAN_STOP) && !(xBits & WIFI_SCAN_START) ) {
         if (++retryConCnt > WIFI_RECONNECT_TRIES) {
            retryConCnt = 0;
            xEventGroupSetBits(wifi_data.eventGroup, WIFI_CONN_FAILED);
            printf("[wifiHandlerAPTask] Wifi Connection Failed\n");
         }
         esp_wifi_disconnect();
         printf("[wifiHandlerAPTask] Wifi Module, connecting to AP\n");
         esp_wifi_connect();
         xEventGroupClearBits(wifi_data.eventGroup, WIFI_CONNECTED);
         xEventGroupSetBits(wifi_data.eventGroup, WIFI_CONNECTING);
      } else if ( (xBits & WIFI_CONNECTED ) && (xBits & WIFI_CONNECTING )  ) {
         xEventGroupClearBits(wifi_data.eventGroup, WIFI_DISCONNECTED|WIFI_CONN_FAILED|WIFI_CONNECTING);
         retryConCnt = 0;
      } else if ( (xBits & WIFI_SCAN_START ) && (xBits & WIFI_CONNECTED ) ){
         esp_wifi_disconnect();
      }

      vTaskDelay(1000 / portTICK_RATE_MS);
   }
}