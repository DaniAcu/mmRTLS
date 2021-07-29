#include "messageUnbundler.h"
#include "utils.h"
#include "packetProcessor.h"
#include "wifiHandler.h"

typedef bool (*forEachOperation_t)( const cJSON *item, size_t index, void *xData );
typedef void (*initOperation_t)( void *xData );
typedef void (*endOperation_t)( void *xData );

static const char *TAG = "messageUnbundler";

static void messageUnbundlerArrayOperationCleanKnownList( void *nlist );
static bool messageUnbundlerArrayOperationGetKnownNodes( const cJSON *item, size_t index, void *nlist );
static int messageUnbundlerParseArray( char *json_s, char *identifier, initOperation_t initFcm, forEachOperation_t iOperation, endOperation_t endFcn, void *xData );

/*============================================================================*/
static void messageUnbundlerArrayOperationCleanKnownList( void *nlist )
{
    uint8_t *knownList = (uint8_t*)nlist;
    ESP_LOGI( TAG, "{Known list} Clear the list before getting the new one\r\n" );
    memset( knownList, 0, MAXKNOWN_NODES_LIST_SIZE );
}
/*============================================================================*/
static void messageUnbundlerArrayOperationCleanCredentials( void *nlist )
{
    ESP_LOGI( TAG, "{AP credential list} Clear the list before getting the new one\r\n" );
    wifi_handler_ap_credentials_t *clist = (wifi_handler_ap_credentials_t*)nlist;
    memset( clist, 0, MAX_ENTRIES_ON_AP_CRED_LIST*sizeof(wifi_handler_ap_credentials_t) );
}
/*============================================================================*/
static bool messageUnbundlerArrayOperationGetKnownNodes( const cJSON *item, size_t index, void *nlist )
{
    bool retVal = true;

    if( index < CONFIG_PROCESSOR_MAXKNOWN_NODES ) {
        uint8_t imac[6] = {0};
        uint8_t *knownList = (uint8_t*)nlist;

        char *itemstr = cJSON_GetStringValue( item );
        ESP_LOGI( TAG,  "[%d]: %s \r\n", index, itemstr );
        utils_str2MAC( itemstr, imac );
        memcpy( &knownList[index*6], imac, sizeof(imac) );
        retVal = false;
    }
    return retVal;
}
/*============================================================================*/
static bool messageUnbundlerArrayOperationGetCredentials( const cJSON *item, size_t index, void *nlist )
{
    bool retVal = true;
    
    if( index < MAX_ENTRIES_ON_AP_CRED_LIST ) {
        wifi_handler_ap_credentials_t *clist = (wifi_handler_ap_credentials_t*)nlist;
        char *strmac, *strpwd;
        cJSON *jmac, *jpwd;

        jmac = cJSON_GetObjectItemCaseSensitive( item, "mac" );
        jpwd = cJSON_GetObjectItemCaseSensitive( item, "pwd" );
        strmac = cJSON_GetStringValue( jmac );
        strpwd = cJSON_GetStringValue( jpwd );

        ESP_LOGI( TAG, "[%d]: %s : %s \r\n", index, strmac, strpwd );
        utils_str2MAC( strmac, clist[ index ].macaddr );
        strncpy( clist[ index ].pwd, strpwd, MAX_CRED_PWD_LENGTH );
        retVal = false;
    }
    return retVal;
}
/*============================================================================*/
static int messageUnbundlerParseArray( char *json_s, char *identifier, initOperation_t initFcm, forEachOperation_t iOperation, endOperation_t endFcn, void *xData )
{
    cJSON *incoming_json = cJSON_Parse( json_s );
    int status = 0;

    if ( NULL == incoming_json ) {
        ESP_LOGE( TAG, "cJSON error parsing incoming array");
        status = -1;
    }
    else {
        const cJSON *arr = NULL;
        const cJSON *item = NULL;
        arr = cJSON_GetObjectItemCaseSensitive( incoming_json, identifier );
        size_t i = 0;
        if ( NULL !=  initFcm ) {
            initFcm( xData );
        }
        if ( NULL != iOperation ) {
            cJSON_ArrayForEach( item, arr){
                if ( iOperation( item, i++, xData ) ) {
                    break;
                }
            }
        }
        if ( NULL !=  endFcn ) {
            endFcn( xData );
        }
        status = (int )i;
    }   
    cJSON_Delete( incoming_json );
    return status;
}
/*============================================================================*/
int messageUnbundlerRetrieveKnownNodes( char *incoming )
{
    return messageUnbundlerParseArray(  incoming, "beacons",  
                                        messageUnbundlerArrayOperationCleanKnownList, 
                                        messageUnbundlerArrayOperationGetKnownNodes, 
                                        NULL,  
                                        processGetListOfKnown() ); 
}
/*============================================================================*/
int messageUnbundlerRetrieveCredenditals( char *incoming )
{
    return messageUnbundlerParseArray(  incoming, "ap_credentials",  
                                        messageUnbundlerArrayOperationCleanCredentials, 
                                        messageUnbundlerArrayOperationGetCredentials, 
                                        NULL,  
                                        wifiHandlerGetAPCredentialList() );     
}
/*============================================================================*/
