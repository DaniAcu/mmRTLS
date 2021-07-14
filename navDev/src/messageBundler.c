#include "messageBundler.h"
#include "utils.h"


/*============================================================================*/
int messageBundlerInsert( messageBundlerEntity_t* pEntity, rssiData_t *pData )
{
    int retValue = -1;
    cJSON *iEntry;
    if ( NULL == pEntity->root ) {
        pEntity->root = cJSON_CreateObject();
        pEntity->array = NULL;
        cJSON *name = NULL;
        
        pEntity->array = cJSON_CreateArray();
        name = cJSON_CreateString( pEntity->MACstr );
         
        if ( ( NULL != name ) && ( NULL != pEntity->array ) ) {
            cJSON_AddItemToObject( pEntity->root, "navDevMac", name);
            cJSON_AddItemToObject( pEntity->root, "Beacons", pEntity->array );
        }
        else {
            printf("[messageBundler] : {cJSON} : Cant allocate a new subentity...\r\n");
        }
    }
   
    if ( NULL != ( iEntry = cJSON_CreateObject() ) ) {
        char iMACstr[ 32 ] = { 0 };
        utilsMAC2str( pData->mac, iMACstr, sizeof(iMACstr) );
        
        cJSON_AddStringToObject( iEntry, "mac",   iMACstr );
        cJSON_AddNumberToObject( iEntry, "channel",   pData->channel );
        cJSON_AddNumberToObject( iEntry, "rssi",	  pData->rssi);
        cJSON_AddNumberToObject( iEntry, "timestamp", pData->timestamp);   
        cJSON_AddItemToObject( pEntity->array, iMACstr, iEntry ); 

        printf("[messageBundler] : Message - Mac=%s, RSSI=%d, channel=%d\n", iMACstr, pData->rssi, pData->channel );
        retValue = 0;   
    }
    else {
        printf("[messageBundler] : {cJSON} : Cant allocate a new subentity...\r\n");
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
}
/*============================================================================*/
int messageBundlerPublish( messageBundlerEntity_t* pEntity, messageBundlerPublisher_t publisherFcn, void *arg )
{
    int retValue = -1;
    char *json_string;
    json_string = cJSON_Print( pEntity->root );
    if ( NULL != json_string ) {
        publisherFcn( json_string, arg );
        printf("%s\r\n", json_string );
        cJSON_free( json_string );
        retValue = 0;
    }
    else {
        printf("[messageBundler] : cJSON_Print cant allocate the string\r\n");
    }
    return retValue;
}
/*============================================================================*/

