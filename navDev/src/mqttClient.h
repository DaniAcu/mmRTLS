#ifndef  MQTTCLIENT_H
#define  MQTTCLIENT_H

    #include <stdio.h>
    #include <stdint.h>
    #include <stddef.h>
    #include <string.h>

    #include "freertos/FreeRTOS.h"
    #include "freertos/task.h"
    #include "freertos/queue.h"
    #include "freertos/event_groups.h"

    #include "mqtt_client.h"

    esp_err_t mqttClientStart( QueueHandle_t messageQueue, EventGroupHandle_t eventGroup );

#endif //MQTTCLIENT_H
