#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_netif.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "esp_log.h"
#include "mqtt_client.h"

#include "RSSIData.h"
#include "mqttClient.h"

#include "mqttConfig.h"

#include "wifiHandler.h"
#include "cJSON.h"

static const char *TAG = "MQTTS_CLIENT";

typedef enum{
    MQTT_CLIENT_CONNECTED          = BIT0,
    MQTT_CLIENT_SUBSCRIBED         = BIT1,
    MQTT_CLIENT_EVENT_PUBLISHED    = BIT2,
    MQTT_CLIENT_DISCONNECTED       = BIT3,
}mqttClient_event_bits_t;

typedef struct{
    EventGroupHandle_t eventGroupWifi;
    EventGroupHandle_t eventGroupMQTT;
    TaskHandle_t xTask;
    QueueHandle_t messageQueue;
    esp_mqtt_client_handle_t client;
}mqttClient_t;

static mqttClient_t mqttClientInstance = { NULL, NULL, NULL, NULL, NULL };

static void mqttClientTask( void *pvParameter );
static void mqttClientEventHandler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data);
static void mqttClientInitClient( mqttClient_t *me );
static void mqttClientStopClient( mqttClient_t *me );
static void mqttClientDisconnect( mqttClient_t *me );
static void mqttClientConnect( mqttClient_t *me  );
static void mqttClientPacketRSSICleanup( cJSON** pEntity );
static int mqttClientPacketRSSIInjectData( cJSON** pEntity, rssiData_t *pData );
static int mqttClientPacketRSSIPublish( mqttClient_t *me, cJSON* pEntity );

/*====================================================================================*/
static void mqttClientEventHandler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    mqttClient_t *me = (mqttClient_t*)handler_args;
    esp_mqtt_event_handle_t event = event_data;
    esp_mqtt_client_handle_t client = event->client;
    int msg_id;

    switch( event->event_id ) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_CONNECTED );
            msg_id = esp_mqtt_client_subscribe(client, CONFIG_MQTT_TOPIC_DATA, 1);
            ESP_LOGI(TAG, "esp_mqtt_client_subscribe, ret/msg_id=%d", msg_id);
            break;
        case MQTT_EVENT_DISCONNECTED:
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_DISCONNECTED );
            ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED");    
            break;
        case MQTT_EVENT_SUBSCRIBED:
            ESP_LOGI(TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id);
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_SUBSCRIBED );
            break;            
        case MQTT_EVENT_UNSUBSCRIBED:
            ESP_LOGI(TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_PUBLISHED:
            ESP_LOGI(TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_EVENT_PUBLISHED );
            break;            
        case MQTT_EVENT_DATA:
            ESP_LOGI(TAG, "MQTT_EVENT_DATA");      
            if ( NULL != strstr( event->topic, CONFIG_MQTT_TOPIC_BEACONSLIST )) {
                /*TODO*/
            }
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
            break;             
        default:
            break;
    }
}
/*====================================================================================*/
static void mqttClientTask( void *pvParameter )
{
    mqttClient_t *me = (mqttClient_t*)pvParameter;
    rssiData_t rssiData;    
    uint8_t count = 0; 
    cJSON *UplinkPacket_Scan = NULL;  /*the root entity to serialize the JSON output*/

    mqttClientInitClient( me );
    printf("mqtt_ClientTask Started, waiting for messages\n");   

    for (;;) {
        if (xQueueReceive( me->messageQueue, &rssiData, portMAX_DELAY ) == pdPASS){
            mqttClientPacketRSSIInjectData( &UplinkPacket_Scan, &rssiData );
            ++count;
        } else {
            printf("[mqttClientTask] Message - error\n");
        }

        /*Test Code: every x messages we disable scan and wait connection to send messages*/
        if ( count > CONFIG_MQTT_MAXENTRIES_IN_TOPICDATA ) {
            count = 0;
            printf("[mqttClientTask] Disabling scan mode to send data\n");
            wifiHandlerScanMode( false );
            xEventGroupWaitBits( me->eventGroupWifi,  WIFI_CONNECTED, false, true, portMAX_DELAY);
            printf("[mqttClientTask] Connecting MQTT Client...\n");
            mqttClientConnect( me );
            xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_CONNECTED | MQTT_CLIENT_SUBSCRIBED, true, true, portMAX_DELAY );
            printf("[mqttClientTask] Sending data...\n");
            mqttClientPacketRSSIPublish( me, UplinkPacket_Scan );
            /*
            waiting for MQTT_CLIENT_EVENT_PUBLISHED causes this error on the mqtt client:
            E (9184) TRANSPORT_BASE: ssl_poll_read select error 104, errno = Connection reset by peer, fd = 54
            E (9184) MQTT_CLIENT: Poll read error: 119, aborting connection
            Apparently, the requests are queued to the task handled by the client, therefore it does not 
            break the normal flow. However the normal flow should wait for the event before disconnecting the client.
            NOTE : still on research, do not remove this comment yet
            xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_EVENT_PUBLISHED, true, true, portMAX_DELAY);
            */
            printf("[mqttClientTask] Stopping MQTT Client...\n");
            mqttClientDisconnect( me );
            xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_DISCONNECTED, true, true, portMAX_DELAY );
            mqttClientStopClient( me );
            printf("[mqttClientTask] Re-enabling scan mode\n");
            mqttClientPacketRSSICleanup( &UplinkPacket_Scan );
            wifiHandlerScanMode( true ); /*re-enable the scanmode*/
        }
    }
}
/*====================================================================================*/
static int mqttClientPacketRSSIPublish( mqttClient_t *me, cJSON* pEntity )
{
    int retValue = -1;
    char *json_string;
    json_string = cJSON_Print( pEntity );
    if( NULL != json_string ) {
        ESP_LOGI(TAG, "esp_mqtt_client_publish, ret/msg_id=%d", esp_mqtt_client_publish( me->client, CONFIG_MQTT_TOPIC_DATA, json_string , 0, 1, 0) );
        cJSON_free( json_string );
        retValue = 0;
    }
    else{
        ESP_LOGI(TAG, "cJSON_Print cant allocate the string");
    }
    return retValue;
}
/*====================================================================================*/
static int mqttClientPacketRSSIInjectData( cJSON** pEntity, rssiData_t *pData )
{
    int retValue = -1;
    cJSON *iEntry;
    if( NULL == *pEntity ){
        *pEntity = cJSON_CreateObject();
    }
   
    if( NULL != ( iEntry = cJSON_CreateObject() ) ){
        char iMACstr[ 32 ] = { 0 };
        snprintf(iMACstr, sizeof(iMACstr), "%02X:%02X:%02X:%02X:%02X:%02X",pData->mac[0], pData->mac[1], pData->mac[2], pData->mac[3], pData->mac[4], pData->mac[5]);
        cJSON_AddItemToObject( *pEntity, iMACstr, iEntry ); 
        cJSON_AddNumberToObject( iEntry, "channel",   pData->channel );
        cJSON_AddNumberToObject( iEntry, "rssi",	  pData->rssi);
        cJSON_AddNumberToObject( iEntry, "timestamp", pData->timestamp);   
        printf("[mqttClientTask] Message - Mac=%s, RSSI=%d, channel=%d\n", iMACstr, pData->rssi, pData->channel );
        retValue = 0;   
    }
    else{
        printf("[mqttClientTask] {cJSON} : Cant allocate a new subentity...\n");
    }
    return retValue;
}
/*====================================================================================*/
static void mqttClientPacketRSSICleanup( cJSON** pEntity )
{
    if( NULL != *pEntity ){
        cJSON_Delete( *pEntity ); /*Delete the cJSON root entity and all subentities recursively*/
    }
    *pEntity = NULL;
}
/*====================================================================================*/
esp_err_t mqttClientStart( QueueHandle_t messageQueue, EventGroupHandle_t eventGroup )
{
    static mqttClient_t *me = NULL; 
    esp_err_t retValue = ESP_FAIL;
    if( NULL == me ){
        me = &mqttClientInstance; 
        me->eventGroupWifi = eventGroup;
        me->eventGroupMQTT = xEventGroupCreate();
        me->messageQueue = messageQueue;
        if( pdPASS  == xTaskCreate(&mqttClientTask, "mqttClientTask", 4096, me, 3, &me->xTask ) ){
            retValue = ESP_OK;
        }
    }
    return retValue;
}
/*====================================================================================*/
static void mqttClientInitClient( mqttClient_t *me )
{
    esp_mqtt_client_config_t mqtt_cfg = {
        .uri = CONFIG_MQTT_BROKER_URI,
    };
    me->client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event( me->client , ESP_EVENT_ANY_ID, mqttClientEventHandler, me );
}
/*====================================================================================*/
static void mqttClientDisconnect( mqttClient_t *me )
{
    esp_err_t err;
    err = esp_mqtt_client_disconnect( me->client );
    if (err) {
        ESP_LOGE(TAG, "esp_mqtt_client_start, %s", esp_err_to_name(err));
        return;
    }
}
/*====================================================================================*/
static void mqttClientConnect( mqttClient_t *me  )
{
    esp_err_t err;
    err = esp_mqtt_client_start( me->client  );
    if (err) {
        ESP_LOGE(TAG, "esp_mqtt_client_start, %s", esp_err_to_name(err));
        return;
    }
}
/*====================================================================================*/
static void mqttClientStopClient( mqttClient_t *me )
{
    esp_err_t err;
    err = esp_mqtt_client_stop( me->client );
    if (err) {
        ESP_LOGE(TAG, "esp_mqtt_client_stop, %s", esp_err_to_name(err));
        return;
    }
}
/*====================================================================================*/
