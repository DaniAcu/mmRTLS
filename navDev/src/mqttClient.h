#ifndef  MQTTCLIENT_H
#define  MQTTCLIENT_H
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"

int32_t startMqttclient(QueueHandle_t messageQueue,EventGroupHandle_t eventGroup);
#endif //MQTTCLIENT_H