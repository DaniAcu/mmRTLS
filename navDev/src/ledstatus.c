#include "ledstatus.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_system.h"

static uint32_t ledStatusPin = 0;
static uint32_t ledStatusBlinkSpeed = 0;
static void ledStatusTask( void *pvParameter );

/*============================================================================*/
void ledStatusInit( uint8_t xPin ){
   ledStatusPin = xPin; 
   gpio_config_t io_conf;
   io_conf.intr_type = GPIO_INTR_DISABLE;
   io_conf.mode = GPIO_MODE_OUTPUT;   
   io_conf.pin_bit_mask = 1ULL << ledStatusPin;
   io_conf.pull_down_en = 0;
   io_conf.pull_up_en = 0;
   gpio_config( &io_conf );   
   /*creating a task for this sucks, however I will create it with the lowest possible priority. Stupid indicator led!!*/
   xTaskCreate( ledStatusTask, (const char *)"ledStatusTask", configMINIMAL_STACK_SIZE, NULL, tskIDLE_PRIORITY+1, NULL );
}
/*============================================================================*/
void ledStatusSetBlinkSpeed( const uint32_t t ){
    ledStatusBlinkSpeed = t;
}
/*============================================================================*/
static void ledStatusTask( void *pvParameter ) 
{
    int blk = 0;
    for (;;) {      
        if( 0 == ledStatusBlinkSpeed ){
            gpio_set_level( ledStatusPin, 0 );
            vTaskDelay( 100/portTICK_RATE_MS );
        }
        else{
            gpio_set_level( ledStatusPin, blk );
            vTaskDelay( ledStatusBlinkSpeed/portTICK_RATE_MS );
            blk = !blk;
        } 
    }
}
/*============================================================================*/
