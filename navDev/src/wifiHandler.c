#include "stdint.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "lwip/err.h"
#include "lwip/sys.h"

#include "wifiHandler.h"
#include "esp_netif.h"
#include "nvsRegistry.h"
#include <string.h>
#include <stdlib.h>

#include "wtd.h"

static const char *TAG = "wifiHandler";
static wifi_handler_data_t wifi_data;
static uint8_t lastChannel = 1u;
static wifi_handler_ap_credentials_t apCredential_list[ MAX_ENTRIES_ON_AP_CRED_LIST ] = { false };

static wifi_config_t wifi_config = {
    .sta = {
        .ssid = WIFI_SSID,
        .password = WIFI_PASS,
        .threshold.authmode = WIFI_AUTH_WPA2_PSK,
        .pmf_cfg = {
           .capable = true,
           .required = false
        },
    },
};

static int wifiHandlerRSSICmpFcn( const void *item1, const void *item2 );

/** 
 * wifi events 
 */
static void wifiEventhandler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) 
{
    if (event_base == WIFI_EVENT) {
        if (event_id == WIFI_EVENT_STA_DISCONNECTED) {
            ESP_LOGI(TAG, "WIFI_EVENT_STA_DISCONNECTED");
            xEventGroupSetBits(  wifi_data.eventGroup, WIFI_DISCONNECTED|WIFI_SCAN_STOP);
            xEventGroupClearBits(wifi_data.eventGroup, WIFI_CONNECTED|WIFI_CONNECTING);
            wifihandlerSetChannel(wifiHandlerGetSavedChannel());
        }else if (event_id == WIFI_EVENT_STA_START) {
            xEventGroupSetBits(wifi_data.eventGroup, WIFI_READY);
        }
    } else if (event_base == IP_EVENT) {
        if (event_id == IP_EVENT_STA_GOT_IP) {
            ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
            ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
            xEventGroupSetBits(wifi_data.eventGroup, WIFI_CONNECTED);
            xEventGroupClearBits(wifi_data.eventGroup, WIFI_DISCONNECTED|WIFI_CONNECTING);
        }
    }
}

static void  wifiHandlerInit(void) 
{
    esp_netif_init();
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    wifi_data.eventGroup  = xEventGroupCreate();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK( esp_wifi_init(&cfg) );
 
    #ifdef CONFIG_IDF_TARGET_ESP32
        esp_netif_create_default_wifi_sta();
        esp_event_handler_instance_t instance_any_id;
        esp_event_handler_instance_t instance_got_ip;
        ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifiEventhandler, NULL, &instance_any_id));
        ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifiEventhandler, NULL, &instance_got_ip));
    #else 
        ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifiEventhandler, NULL));  // deprecated
        ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifiEventhandler, NULL)); // deprecated
    #endif

    wifi_country_t wificountry = {
        .cc = "CN",
        .schan = 1,
        .nchan = wifi_data.nChannels
    };

    ESP_ERROR_CHECK(esp_wifi_set_country(&wificountry));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config) );
    ESP_ERROR_CHECK(esp_wifi_start());
}

/**
 *  START CONFIG
 */
int32_t wifiHandlerStart(uint8_t nChannels, wifi_promiscuous_cb_t wifiPacketHandler) 
{
    memset( apCredential_list, 0, sizeof(apCredential_list) ); 
    wifi_data.nChannels = nChannels;
    wifi_data.packetHandler = wifiPacketHandler;
    wifiHandlerInit();
    
    ESP_LOGI( TAG, "Wifi Module Started, configuring promiscuous mode");
    ESP_ERROR_CHECK(esp_wifi_set_promiscuous_rx_cb(wifi_data.packetHandler));
    wifi_promiscuous_filter_t snifferFilter = {0};
    snifferFilter.filter_mask = WIFI_PROMIS_FILTER_MASK_DATA | WIFI_PROMIS_FILTER_MASK_MGMT;
    if (snifferFilter.filter_mask != 0) {
        ESP_ERROR_CHECK(esp_wifi_set_promiscuous_filter(&snifferFilter));
    }
    
    wifiHandlerAPCredentialListLoad();

    xTaskCreate( wifiHandlerAPTask, (const char *)"wifiHandlerAPTask", configMINIMAL_STACK_SIZE*4, NULL, tskIDLE_PRIORITY+1, NULL);
    return ESP_OK;
}

void wifihandlerSetChannel(uint8_t channel) 
{
    esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
}

int32_t wifiHandlerScanMode(bool enabled) 
{
    xEventGroupClearBits(wifi_data.eventGroup, enabled ? WIFI_SCAN_STOP  : WIFI_SCAN_START);
    xEventGroupSetBits(  wifi_data.eventGroup, enabled ? WIFI_SCAN_START : WIFI_SCAN_STOP);   
 
    if ( true == enabled ) {
        xEventGroupWaitBits(wifi_data.eventGroup, WIFI_DISCONNECTED , false, true, portMAX_DELAY);
    }
 
    ESP_ERROR_CHECK(esp_wifi_set_promiscuous(enabled));
 
    return ESP_OK;
}

void wifiHandlerSaveChannel(uint8_t currentChan)
{
    lastChannel = currentChan;
}

uint8_t wifiHandlerGetSavedChannel(void)
{
    return lastChannel;
}

EventGroupHandle_t wifiHandlerGetEventGroup(void)
{
    return wifi_data.eventGroup;
}

int32_t wifiHandlercheckAp(void)
{
    return 1;
}

int32_t wifiHandler_getStatusConnection(void) 
{
    return 1;
}

/**
 * TASK 
*/
void wifiHandlerAPTask( void* taskParmPtr ) 
{
    uint8_t retryConCnt = 0;
    EventBits_t xBits;
    ESP_LOGI( TAG, "Started, Waiting wifi module to be ready...");
    xBits = xEventGroupWaitBits(wifi_data.eventGroup, WIFI_READY, false, true, portMAX_DELAY);
    
    xEventGroupSetBits(wifi_data.eventGroup, WIFI_DISCONNECTED);
    
    ESP_LOGI( TAG, "Ready, Waiting connection mode...");
    wtdSubscribeTask();
    for (;;) {
        xBits = xEventGroupWaitBits(wifi_data.eventGroup,  WIFI_DISCONNECTED | WIFI_CONNECTED | WIFI_SCAN_START | WIFI_SCAN_STOP, false, false, portMAX_DELAY);
       
        if ((xBits & WIFI_DISCONNECTED) && !(xBits & WIFI_CONNECTING) && (xBits & WIFI_SCAN_STOP) && !(xBits & WIFI_SCAN_START) ) {
            if (++retryConCnt > WIFI_RECONNECT_TRIES) {
                retryConCnt = 0;
                xEventGroupSetBits(wifi_data.eventGroup, WIFI_CONN_FAILED);
                ESP_LOGE( TAG, "Wifi Connection Failed");
            }
            esp_wifi_disconnect();
            ESP_LOGI( TAG, "Wifi Module, connecting to AP...\n");
            #if ( WIFI_USE_ROAMING == 1 )
                wifiHandlerSetBestAPbyList();
            #endif
            esp_wifi_connect();
            xEventGroupClearBits(wifi_data.eventGroup, WIFI_CONNECTED);
            xEventGroupSetBits(wifi_data.eventGroup, WIFI_CONNECTING);
        } else if ( (xBits & WIFI_CONNECTED ) && (xBits & WIFI_CONNECTING )  ) {
            xEventGroupClearBits(wifi_data.eventGroup, WIFI_DISCONNECTED|WIFI_CONN_FAILED|WIFI_CONNECTING);
            retryConCnt = 0;
        } else if ( (xBits & WIFI_SCAN_START ) && (xBits & WIFI_CONNECTED ) ) {
            esp_wifi_disconnect();
        }

        vTaskDelay(1000 / portTICK_RATE_MS);
        wtdFeed();
    }
}

wifi_handler_ap_credentials_t* wifiHandlerGetAPCredentialList( void )
{
    return apCredential_list;
}

int wifiHandlerGetAPIndexFromListbyMAC( uint8_t *mac2find )
{
    size_t i;
    int index = -1;
    uint8_t nullentry[6] = { 0 };
    uint8_t *imac;
    
    for ( i = 0 ; i < MAX_ENTRIES_ON_AP_CRED_LIST; i++ ) {
        imac = apCredential_list[ i ].macaddr;
        if ( 0 == memcmp( imac, nullentry, 6 ) ) { 
            index = -1; /*end of the list reached*/
            break;
        }
        if ( 0 == memcmp( imac, mac2find, 6 ) ) { 
            index = i;
            break;
        }
    }
    return index;
}

int wifiHandlerAPCredentialListInsertSSDI( int index, char *ssid, int8_t ap_rssid )
{
    int retVal = -1;
    if ( index < MAX_ENTRIES_ON_AP_CRED_LIST ) {
        if ( 0 == strlen(apCredential_list[index].ssid) ) { /*only the first time, when the entry is empty*/
            strncpy( apCredential_list[ index ].ssid, ssid, MAX_SSID_NAME_LENGTH  );
        }
        apCredential_list[ index ].rssi = ap_rssid; /*always keep the last*/
        apCredential_list[ index ].valid = true;
        retVal = 0;
    }
    return retVal;
}


static int wifiHandlerRSSICmpFcn( const void *item1, const void *item2 )
{
    const wifi_handler_ap_credentials_t *i1 = item1;
    const wifi_handler_ap_credentials_t *i2 = item2;
    int8_t rssi1, rssi2;

    rssi1 = ( i1->valid )? i1->rssi : INT8_MIN; /*invalid : entry penalty*/
    rssi2 = ( i2->valid )? i2->rssi : INT8_MIN; /*invalid : entry penalty*/
    return ( (int)rssi2 - (int)rssi1 ); /*best rssi first*/
}


int wifiHandlerSetBestAPbyList( void )
{
    int retVal = -1;
    wifi_handler_ap_credentials_t bestSignalAp;
    
    qsort( apCredential_list,  MAX_ENTRIES_ON_AP_CRED_LIST, sizeof(wifi_handler_ap_credentials_t), wifiHandlerRSSICmpFcn );
    bestSignalAp = apCredential_list[ 0 ]; /*AP with the best signal on top*/

    if ( ( bestSignalAp.valid ) && ( strlen( bestSignalAp.ssid ) > 0u ) ) {
        strncpy( (char*)wifi_config.sta.ssid, bestSignalAp.ssid, MAX_SSID_NAME_LENGTH );
        strncpy( (char*)wifi_config.sta.password, bestSignalAp.pwd, MAX_CRED_PWD_LENGTH );
        ESP_LOGI( TAG, "Connecting to AP [ %s ] with rssi = %d ...", bestSignalAp.ssid , bestSignalAp.rssi);
        return 0;
    }
    else {
        strncpy( (char*)wifi_config.sta.ssid, WIFI_SSID, MAX_SSID_NAME_LENGTH );
        strncpy( (char*)wifi_config.sta.password, WIFI_PASS, MAX_CRED_PWD_LENGTH );
        ESP_LOGI( TAG, "Connecting to the default AP...");
    }

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config) );

    return retVal;
}

int wifiHandlerAPCredentialListStore( wifi_handler_ap_credentials_t *list )
{
    int32_t ret = ESP_ERR_NOT_FOUND;

    ESP_LOGI( TAG, "Saving AP credential list..." );
    #if ( WIFI_PERSISTENT_CREDENTIALS == 1 )
    ret = setDataBlockRawToNvs( "apcredlist" , list, MAX_ENTRIES_ON_AP_CRED_LIST*sizeof(wifi_handler_ap_credentials_t) );
    #endif
    if ( ESP_OK == ret ) {
        ESP_LOGI( TAG, "AP credential saved!" );
    }
    else {
        ESP_LOGE( TAG, "{SAVE} Failed" );
    }
    return ret;
}

int wifiHandlerAPCredentialListLoad( void )
{
    int32_t ret = ESP_ERR_NOT_FOUND;
    #if ( WIFI_PERSISTENT_CREDENTIALS == 1 )
    ret = getDataBlockRawFromNvs( "apcredlist", apCredential_list, MAX_ENTRIES_ON_AP_CRED_LIST*sizeof(wifi_handler_ap_credentials_t) );
    #endif
    if ( ESP_OK == ret ) {
        uint32_t emptycheck = NVS_EMPTY_DWORD;
        if ( 0 == memcmp( &apCredential_list, &emptycheck, sizeof(emptycheck) ) ) {
            ESP_LOGI( TAG, "AP credential area  empty, start with an empty list" );
            memset( &apCredential_list, 0x00, MAX_ENTRIES_ON_AP_CRED_LIST*sizeof(wifi_handler_ap_credentials_t) );
        }
        ESP_LOGI( TAG, "AP credential loaded!" );
    }
    else {
        ESP_LOGE( TAG, "{LOAD} Failed" );
    }
    return ret;
}