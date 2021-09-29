#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "esp_log.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "mqtt_client.h"
#include "RSSIData.h"
#include "mqttClient.h"
#include "mqttConfig.h"
#include "wifiHandler.h"
#include "messageBundler.h"
#include "messageUnbundler.h"
#include "utils.h"

static const char *TAG = "MQTTS_CLIENT";

typedef enum
{
    MQTT_CLIENT_CONNECTED          = BIT0,
    MQTT_CLIENT_SUBSCRIBED         = BIT1,
    MQTT_CLIENT_EVENT_PUBLISHED    = BIT2,
    MQTT_CLIENT_DISCONNECTED       = BIT3,
    MQTT_CLIENT_UNSUBSCRIBED       = BIT4,
} mqttClient_event_bits_t;

typedef struct
{
    EventGroupHandle_t eventGroupWifi;
    EventGroupHandle_t eventGroupMQTT;
    TaskHandle_t xTask;
    QueueHandle_t messageQueue;
    esp_mqtt_client_handle_t client;
} mqttClient_t;

static mqttClient_t mqttClientInstance = { NULL, NULL, NULL, NULL, NULL };

static void mqttClientTask( void *pvParameter );
static void mqttClientEventHandler( void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data );
static void mqttClientInitClient( mqttClient_t *me );
static void mqttClientStopClient( mqttClient_t *me );
static void mqttClientDisconnect( mqttClient_t *me );
static void mqttClientConnect( mqttClient_t *me );
static void mqttClientPacketSend( char *packet, void *client );

/*============================================================================*/
static void mqttClientEventHandler( void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data )
{
    mqttClient_t *me = (mqttClient_t*)handler_args;
    esp_mqtt_event_handle_t event = event_data;
    esp_mqtt_client_handle_t client = event->client;
    int msg_id;

    switch( event->event_id ) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI( TAG, "MQTT_EVENT_CONNECTED" );
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_CONNECTED );
            msg_id = esp_mqtt_client_subscribe( client, CONFIG_MQTT_TOPIC_AP_CREDENTIALS, 0 );
            ESP_LOGI( TAG, "esp_mqtt_client_subscribe, ret/msg_id=%d", msg_id );
            msg_id = esp_mqtt_client_subscribe( client, CONFIG_MQTT_TOPIC_KNOWN_NODES, 0 );
            ESP_LOGI( TAG, "esp_mqtt_client_subscribe, ret/msg_id=%d", msg_id );
            break;
        case MQTT_EVENT_DISCONNECTED:
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_DISCONNECTED );
            ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED" );    
            break;
        case MQTT_EVENT_SUBSCRIBED:
            ESP_LOGI( TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id );
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_SUBSCRIBED );
            break;            
        case MQTT_EVENT_UNSUBSCRIBED:
            ESP_LOGI( TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id );
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_UNSUBSCRIBED );
            break;
        case MQTT_EVENT_PUBLISHED:
            ESP_LOGI( TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id );
            xEventGroupSetBits( me->eventGroupMQTT, MQTT_CLIENT_EVENT_PUBLISHED );
            break;            
        case MQTT_EVENT_DATA:
            ESP_LOGI( TAG, "MQTT_EVENT_DATA" );      
            if ( NULL != strstr( event->topic, CONFIG_MQTT_TOPIC_KNOWN_NODES ) ) {
                ESP_LOGI( TAG, "========== CONFIG_MQTT_TOPIC_KNOWN_NODES ==========" );
                messageUnbundlerRetrieveKnownNodes( event->data ); 
            }
            else if ( NULL != strstr( event->topic, CONFIG_MQTT_TOPIC_AP_CREDENTIALS ) ) {
                ESP_LOGI( TAG, "========== CONFIG_AP_CREDENTIAL_LIST ==========" );
                #if ( CONFIG_WIFI_USE_ROAMING == 1 )
                    messageUnbundlerRetrieveCredenditals( event->data );
                #endif
            }
            else {
                ESP_LOGE( TAG, "Unknown topic : %s", event->topic );
            }
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGE(TAG, "MQTT_EVENT_ERROR" );
            break;             
        default:
            break;
    }
}
/*============================================================================*/
static void mqttClientTask( void *pvParameter )
{
    mqttClient_t *me = (mqttClient_t*)pvParameter;
    rssiData_t rssiData;    
    BaseType_t queueDataStatus;
    size_t cBundled;
    messageBundlerEntity_t UplinkPacket_Scan = MESSAGEBUNDLER_ENTITY_INITIALIZER;  /*the message bundler entity to serialize the JSON output*/
    uint8_t thisMAC[ MAC_ADDR_LENGTH ] = { 0 };
    char thisMACStr[ 32 ] = { 0 };

    UplinkPacket_Scan.MACstr = thisMACStr;
    esp_wifi_get_mac( WIFI_IF_STA, thisMAC ); 
    utilsMAC2str( thisMAC, thisMACStr, sizeof(thisMACStr) ); 
    mqttClientInitClient( me );
    ESP_LOGI( TAG, "mqtt_ClientTask Started, waiting for messages\n" );   
    for (;;) {
        queueDataStatus = xQueueReceive( me->messageQueue, &rssiData, CONFIG_MQTT_NODATA_TIMEOUT/portTICK_PERIOD_MS ); 
        if ( pdPASS == queueDataStatus ) {
            messageBundlerInsert( &UplinkPacket_Scan, &rssiData );
        } 
        else {
            ESP_LOGE( TAG, "xQueueReceive TIMEOUT: no data available." );
        }
        cBundled = messageBundlerItemsInside( &UplinkPacket_Scan );
        if ( ( cBundled > CONFIG_MQTT_MAXENTRIES_IN_TOPICDATA ) || ( errQUEUE_EMPTY == queueDataStatus ) ) {
            ESP_LOGI( TAG, "Disabling scan mode to send data" );
            wifiHandlerScanMode( false );
            xEventGroupWaitBits( me->eventGroupWifi,  WIFI_CONNECTED, false, true, portMAX_DELAY );
            ESP_LOGI( TAG, "Connecting to MQTT broker %s", CONFIG_MQTT_BROKER_URI );
            mqttClientConnect( me );
            xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_CONNECTED | MQTT_CLIENT_SUBSCRIBED, true, true, portMAX_DELAY );
            if ( cBundled > 0u ) { /*if timeout, send any available data that was already bundled*/
                ESP_LOGI( TAG, "Sending data..." );
                messageBundlerPublish( &UplinkPacket_Scan, mqttClientPacketSend, me->client );
            }
            xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_EVENT_PUBLISHED, true, true, CONFIG_MQTT_RCVDATA_TIMEOUT/portTICK_PERIOD_MS );
            ESP_LOGI( TAG, "Stopping MQTT Client..." );
            mqttClientDisconnect( me );
            xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_DISCONNECTED, true, true, portMAX_DELAY );
            mqttClientStopClient( me );
            ESP_LOGI( TAG, "Re-enabling scan mode" );
            messageBundlerCleanup( &UplinkPacket_Scan );
            wifiHandlerScanMode( true ); /*re-enable the scanmode*/
        }
    }
}
/*============================================================================*/
static void mqttClientPacketSend( char *packet, void *client )
{
    esp_mqtt_client_handle_t hClient = (esp_mqtt_client_handle_t)client;
    ESP_LOGI( TAG, "esp_mqtt_client_publish, ret/msg_id=%d", esp_mqtt_client_publish( hClient, CONFIG_MQTT_TOPIC_DATA, packet , 0, 1, 0 ) ); 
}
/*============================================================================*/
esp_err_t mqttClientStart( QueueHandle_t messageQueue, EventGroupHandle_t eventGroup )
{
    static mqttClient_t *me = NULL; 
    esp_err_t retValue = ESP_FAIL;
    if ( NULL == me ) {
        me = &mqttClientInstance; 
        me->eventGroupWifi = eventGroup;
        me->eventGroupMQTT = xEventGroupCreate();
        me->messageQueue = messageQueue;
        if ( pdPASS  == xTaskCreate( &mqttClientTask, "mqttClientTask", 4096, me, 3, &me->xTask ) ) {
            retValue = ESP_OK;
        }
    }
    return retValue;
}
/*============================================================================*/
static void mqttClientInitClient( mqttClient_t *me )
{
    esp_mqtt_client_config_t mqtt_cfg = {
        .uri = CONFIG_MQTT_BROKER_URI,
    };
    me->client = esp_mqtt_client_init( &mqtt_cfg );
    esp_mqtt_client_register_event( me->client , ESP_EVENT_ANY_ID, mqttClientEventHandler, me );
}
/*============================================================================*/
static void mqttClientDisconnect( mqttClient_t *me )
{
    esp_err_t err;
    esp_mqtt_client_unsubscribe( me->client, CONFIG_MQTT_TOPIC_AP_CREDENTIALS );
    esp_mqtt_client_unsubscribe( me->client, CONFIG_MQTT_TOPIC_KNOWN_NODES );
    xEventGroupWaitBits( me->eventGroupMQTT,  MQTT_CLIENT_UNSUBSCRIBED, true, true, 200/portTICK_PERIOD_MS );
    err = esp_mqtt_client_disconnect( me->client );
    if ( err ) {
        ESP_LOGE( TAG, "esp_mqtt_client_start, %s", esp_err_to_name(err) );
        return;
    }
}
/*============================================================================*/
static void mqttClientConnect( mqttClient_t *me )
{
    esp_err_t err;
    err = esp_mqtt_client_start( me->client  );
    if ( err ) {
        ESP_LOGE( TAG, "esp_mqtt_client_start, %s", esp_err_to_name(err) );
        return;
    }
}
/*============================================================================*/
static void mqttClientStopClient( mqttClient_t *me )
{
    esp_err_t err;
    err = esp_mqtt_client_stop( me->client );
    if (err) {
        ESP_LOGE( TAG, "esp_mqtt_client_stop, %s", esp_err_to_name(err) );
        return;
    }
}
/*============================================================================*/
