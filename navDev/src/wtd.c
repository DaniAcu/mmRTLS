#include "wtd.h"

#define CHECK_ERROR_CODE(returned, expected) ({                        \
            if(returned != expected){                                  \
                printf("TWDT ERROR\n");                                \
            }                                                          \
})

#define TWDT_TIMEOUT_S          3


void wtdInitTask(uint8_t time)
{
    #if CONFIG_IDF_TARGET_ESP32
        CHECK_ERROR_CODE(esp_task_wdt_init(time, false), ESP_OK);
        #ifndef CONFIG_ESP_TASK_WDT_CHECK_IDLE_TASK_CPU0
            esp_task_wdt_add(xTaskGetIdleTaskHandleForCPU(0));
        #endif
        #if CONFIG_ESP_TASK_WDT_CHECK_IDLE_TASK_CPU1 && !CONFIG_FREERTOS_UNICORE
            esp_task_wdt_add(xTaskGetIdleTaskHandleForCPU(1));
        #endif
    #else
        CHECK_ERROR_CODE(esp_task_wdt_init(), ESP_OK);
        (void)time;
    #endif
}


void wtdSubscribeTask(void)
{
    #if CONFIG_IDF_TARGET_ESP32
        CHECK_ERROR_CODE(esp_task_wdt_add(NULL), ESP_OK);
        CHECK_ERROR_CODE(esp_task_wdt_status(NULL), ESP_OK);
    #endif
}

void wtdFeed(void)
{
    esp_task_wdt_reset();
}