#include "wtd.h"


#define TWDT_DEFAULT_TIMEOUT_S          ( 11u )

/*============================================================================*/
void wtdInitTask( uint32_t xTime )
{
    #if CONFIG_IDF_TARGET_ESP32
        ESP_ERROR_CHECK(esp_task_wdt_init( xTime, false ) );
        #ifndef CONFIG_ESP_TASK_WDT_CHECK_IDLE_TASK_CPU0
            esp_task_wdt_add(xTaskGetIdleTaskHandleForCPU(0));
        #endif
        #if CONFIG_ESP_TASK_WDT_CHECK_IDLE_TASK_CPU1 && !CONFIG_FREERTOS_UNICORE
            esp_task_wdt_add(xTaskGetIdleTaskHandleForCPU(1));
        #endif
    #else
        ESP_ERROR_CHECK(esp_task_wdt_init());
        (void)xTime;
    #endif
}
/*============================================================================*/
void wtdSubscribeTask( void )
{
    #if CONFIG_IDF_TARGET_ESP32
        ESP_ERROR_CHECK(esp_task_wdt_add(NULL));
        ESP_ERROR_CHECK(esp_task_wdt_status(NULL));
    #endif
}
/*============================================================================*/
void wtdFeed( void )
{
    esp_task_wdt_reset();
}
/*============================================================================*/
