#include "messageBundler.h"
#include "esp_log.h"
#include "utils.h"

static const char *TAG = "messageBundler";

/*============================================================================*/
int messageBundlerInsert( messageBundlerEntity_t* pEntity, rssiData_t *pData )
{
    int retValue = -1;
    cJSON *iEntry;
    if ( NULL == pEntity->root ) {
        pEntity->messagesBundled = 0u;
        pEntity->root = cJSON_CreateObject();
        pEntity->array = NULL;
        cJSON *name = NULL;
        
        pEntity->array = cJSON_CreateArray();
        name = cJSON_CreateString( pEntity->MACstr );
         
        if ( ( NULL != name ) && ( NULL != pEntity->array ) ) {
            cJSON_AddItemToObject( pEntity->root, "navDevMac", name );
            cJSON_AddItemToObject( pEntity->root, "Beacons", pEntity->array );
        }
        else {
            ESP_LOGE( TAG, "{cJSON} : Cant allocate a new subentity...");
        }
    }
   
    if ( NULL != ( iEntry = cJSON_CreateObject() ) ) {
        char iMACstr[ 32 ] = { 0 };
        utilsMAC2str( pData->mac, iMACstr, sizeof(iMACstr) );
        
        cJSON_AddStringToObject( iEntry, "mac",   iMACstr );
        cJSON_AddNumberToObject( iEntry, "channel",   pData->channel );
        cJSON_AddNumberToObject( iEntry, "rssi",	  pData->rssi );
        cJSON_AddNumberToObject( iEntry, "timestamp", pData->timestamp );   
        cJSON_AddItemToObject( pEntity->array, iMACstr, iEntry ); 
        pEntity->messagesBundled++;
        ESP_LOGI( TAG, "Message - Mac=%s, RSSI=%d, channel=%d", iMACstr, pData->rssi, pData->channel );
        retValue = 0;   
    }
    else {
        ESP_LOGE( TAG, "{cJSON} : Cant allocate a new subentity..." );
    }
    return retValue;
}
/*============================================================================*/
void messageBundlerCleanup( messageBundlerEntity_t* pEntity )
{
    if ( NULL != pEntity->root ) {
        cJSON_Delete( pEntity->root ); /*Delete the cJSON root entity and all subentities recursively*/
    }
    pEntity->root = NULL;
    pEntity->array = NULL;
    pEntity->messagesBundled = 0u;
}
/*============================================================================*/
int messageBundlerPublish( messageBundlerEntity_t* pEntity, messageBundlerPublisher_t publisherFcn, void *arg )
{
    int retValue = -1;
    char *json_string;
    json_string = cJSON_Print( pEntity->root );
    if ( NULL != json_string ) {
        publisherFcn( json_string, arg );
        ESP_LOGI( TAG, "%s\r\n", json_string );
        cJSON_free( json_string );
        retValue = 0;
    }
    else {
        ESP_LOGE( TAG, "cJSON_Print cant allocate the string" );
    }
    return retValue;
}
/*============================================================================*/
size_t messageBundlerItemsInside( messageBundlerEntity_t* pEntity ){
    size_t retValue = 0u;
    if ( NULL != pEntity->root ) {
        retValue = pEntity->messagesBundled;
    }    
    return retValue;
}
/*============================================================================*/