#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_attr.h"
#include "esp_sleep.h"
#include "esp_sntp.h"
#include "wifiHandler.h"

#include "sntpUpdate.h"

TaskHandle_t sntpUpdateTaskHandle;
static const char *TAG = "SNTP";

static void sntpUpdateTimeSyncNotificationCB(struct timeval *tv);
static void sntpUpdateInitialize(void);
static void sntpUpdateTime(void);
static void sntpUpdateTask( void *pvParameter );


/*====================================================================================*/
static void sntpUpdateTimeSyncNotificationCB(struct timeval *tv){
    ESP_LOGI(TAG, "Notification of a time synchronization event");
}
/*====================================================================================*/
static void sntpUpdateInitialize(void)
{
    ESP_LOGI(TAG, "Initializing SNTP");
    sntp_setoperatingmode( CONFIG_SNTP_OPERATING_MODE );
    sntp_setservername( 0, CONFIG_SNTP_SERVER_NAME );
    sntp_set_time_sync_notification_cb( sntpUpdateTimeSyncNotificationCB );
    sntp_init();
}
/*====================================================================================*/
static void sntpUpdateTime(void)
{
    time_t now = 0;
    struct tm timeinfo = { 0 };
    int retry = 0;
    const int retry_count = 3;
   
    sntpUpdateInitialize();

    /* wait for time to be set*/
    while (sntp_get_sync_status() == SNTP_SYNC_STATUS_RESET && ++retry < retry_count) {
        ESP_LOGI(TAG, "Waiting for system time to be set... (%d/%d)", retry, retry_count);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
    time(&now);
    localtime_r(&now, &timeinfo);
}
/*====================================================================================*/
static void sntpUpdateTask( void *pvParameter )
{
    time_t now;
    struct tm timeinfo;
    char strftime_buf[64] = {0};
    EventGroupHandle_t eventGroup = (EventGroupHandle_t)pvParameter;

    sntpUpdateRequestSync(); /*request for the first time*/
    ESP_LOGI(TAG, "Starting the NTP time sync service.");
    for(;;){
        xTaskNotifyWait( 0x00, ULONG_MAX, NULL, portMAX_DELAY ); 
        ESP_LOGI(TAG, "NTP Syncronization requested. Waiting for connectivity...");
        xEventGroupWaitBits( eventGroup,  WIFI_CONNECTED , false, true, portMAX_DELAY);
        time(&now);
        localtime_r(&now, &timeinfo);
        if (timeinfo.tm_year < (2016 - 1900)) {
            ESP_LOGI(TAG, "Time is not set yet. Getting time over NTP....");
            sntpUpdateTime();
            time(&now);
            localtime_r(&now, &timeinfo);
            strftime(strftime_buf, sizeof(strftime_buf), "%c", &timeinfo);
            ESP_LOGI(TAG, "The current UTC date/time is: %s", strftime_buf);
            sntp_stop();
        }
    }
}
/*====================================================================================*/
void sntpUpdateStart( EventGroupHandle_t eventGroup )
{
    xTaskCreate(&sntpUpdateTask, "sntpUpdateTask", 4096, eventGroup, 1, &sntpUpdateTaskHandle );
}
/*====================================================================================*/
void sntpUpdateRequestSync( void )
{   
    xTaskNotify( sntpUpdateTaskHandle, 0, eNoAction );
}
/*====================================================================================*/
