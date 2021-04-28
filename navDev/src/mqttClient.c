#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "freertos/Queue.h"

#include "mqttClient.h"
#include "RSSIData.h"

//Task
void mqttClientTask(void *pvParameter)
{
    QueueHandle_t messageQueue = (QueueHandle_t)pvParameter;
    rssiData_t rssiData;
    printf("mqttClientTask Started, waiting for messages\n");
    

    for (;;) {
        if (xQueueReceive( messageQueue, &rssiData, portMAX_DELAY ) == pdPASS)
        {
            printf("Received Message with Mac=%x:%x:%x:%x:%x:%x, RSSI=%d, channel=%d\n", 
                rssiData.mac[0], rssiData.mac[1], rssiData.mac[2], rssiData.mac[3], rssiData.mac[4], rssiData.mac[5], rssiData.rssi, rssiData.channel);
        } else {
            printf("Received Messag with error\n");
        }

    }
}

int32_t startMqttclient(QueueHandle_t messageQueue)
{
    xTaskCreate(&mqttClientTask, "mqttClientTask", 2048, messageQueue, 3, NULL);
    return ESP_OK;
}