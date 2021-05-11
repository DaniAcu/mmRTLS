#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"

#include "mqttClient.h"
#include "RSSIData.h"
#include "esp_netif.h"

//Task
#include "wifiHandler.h"

static EventGroupHandle_t mqttClientEventGroup;

void mqttClientTask(void *pvParameter)
{
    QueueHandle_t messageQueue = (QueueHandle_t)pvParameter;
    rssiData_t rssiData;
    printf("[mqttClientTask] Started, waiting for messages\n");
    
    uint8_t count = 0;
    for (;;) {
        if (xQueueReceive( messageQueue, &rssiData, portMAX_DELAY ) == pdPASS)
        {
            printf("[mqttClientTask] Message - Mac=%x:%x:%x:%x:%x:%x, RSSI=%d, channel=%d\n", 
                rssiData.mac[0], rssiData.mac[1], rssiData.mac[2], rssiData.mac[3], rssiData.mac[4], rssiData.mac[5], rssiData.rssi, rssiData.channel);
        } else {
            printf("[mqttClientTask] Message - error\n");
        }

        // Test Code: every x messages we disable scan and wait connection to send messages
        if (++count > 50) {
            count = 0;
            printf("[mqttClientTask] Disabling scan mode to send data\n");
            wifiHandlerScanMode(false);
            xEventGroupWaitBits(mqttClientEventGroup,  WIFI_CONNECTED, false, true, portMAX_DELAY);
            printf("[mqttClientTask] Sending Data....\n");
            printf("[mqttClientTask] Re-enabling scan mode\n");
            wifiHandlerScanMode(true);
        }
    }
}
int32_t startMqttclient(QueueHandle_t messageQueue, EventGroupHandle_t eventGroup)
{   mqttClientEventGroup = eventGroup;
    xTaskCreate(&mqttClientTask, "mqttClientTask", 2048, messageQueue, 3, NULL);
    return ESP_OK;
}