#include <stddef.h>

#include "nvsRegistry.h"
#include "esp_system.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "nvs.h"


#ifdef CONFIG_IDF_TARGET_ESP32
    #define NVS_HDLR nvs_handle_t
#else 
    #define NVS_HDLR nvs_handle
#endif

#define STORAGE_NAMESPACE "storage"
static const char *TAG = "NVM Storage";

/*============================================================================*/
int32_t initializeNVSRegistry( void )
{
    esp_err_t err = nvs_flash_init(); /* Initialize NVS */

    if ( ESP_ERR_NVS_NO_FREE_PAGES == err ) {
        
        ESP_ERROR_CHECK( nvs_flash_erase() ); /* NVS partition was truncated and needs to be erased, retry nvs_flash_init */
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK( err );

    return err;
}
/*============================================================================*/
int32_t getValueFromNVSRegistry( const char *key, void *outValue, NvsRegistryDataType dataType, size_t length )
{
    NVS_HDLR handle;
    esp_err_t err = nvs_open( STORAGE_NAMESPACE,NVS_READONLY , &handle ); /*NVS_READWRITE*/

    if ( ESP_OK != err )  {
        ESP_LOGE( TAG, "Error (%s) opening NVS handle!", esp_err_to_name( err ) );
        return err;
    } 
    else {
        switch (dataType) {
            case NvsRegistryDataType8:
                err = nvs_get_i8( handle, key, outValue );
                break;
            case NvsRegistryDataType16:
                err = nvs_get_i16( handle, key, outValue );
                break;
            case NvsRegistryDataType32:
                err = nvs_get_i32( handle, key, outValue );
                break;
            case NvsRegistryDataType64:
                err = nvs_get_i64( handle, key, outValue );
                break;
            case NvsRegistryDataTypeStr:
                err = nvs_get_str( handle, key, outValue, &length );
                break;
        }
        if( ESP_OK == err ){
            ESP_LOGI( TAG, "Failed, Error (%s)", esp_err_to_name( err ) );
        }
        
        nvs_close(handle);
    }

    return err;
}
/*============================================================================*/
int32_t setValueToNVSRegistry( const char *key, void *inValue, NvsRegistryDataType dataType ) 
{
    NVS_HDLR handle;
    esp_err_t err = nvs_open( STORAGE_NAMESPACE, NVS_READWRITE, &handle );
    if ( ESP_OK != err ) {
        ESP_LOGE( TAG, "Error (%s) opening NVS handle!\n", esp_err_to_name( err ) );
        return err;
    }
    else {
        ESP_LOGI( TAG, "Done" );
        switch ( dataType ) {
            case NvsRegistryDataType8:
                err = nvs_set_u8( handle, key, *((uint8_t*)inValue) );
                break;
            case NvsRegistryDataType16:
                err = nvs_set_i16( handle, key, *((int16_t*)inValue) );
                break;
            case NvsRegistryDataType32:
                err = nvs_set_i32( handle, key, *((int32_t*)inValue) );
                break;
            case NvsRegistryDataType64:
                err = nvs_set_i64( handle, key, *((int64_t*)inValue) );
                break;
            case NvsRegistryDataTypeStr:
                err = nvs_set_str( handle, key, (char*)inValue );
                break;
        }
        if ( ESP_OK != err ) {
            ESP_LOGI( TAG, "Committing updates in NVS..." );
            err = nvs_commit( handle );
            if( ESP_OK == err ){
                ESP_LOGI( TAG, "Failed, Error (%s)", esp_err_to_name( err ) );
            }
        }
        nvs_close(handle);
    }

    return ESP_OK;
}
/*============================================================================*/
int32_t setDataBlockRawToNvs( const char *key, void *input, size_t len )
{
    NVS_HDLR my_handle;
    uint8_t* inputData = (uint8_t*)input;
    
    esp_err_t err = nvs_open( STORAGE_NAMESPACE, NVS_READWRITE, &my_handle );
    if ( ESP_OK != err ) {
        ESP_LOGE( TAG, "Error (%s) opening NVS handle!\n", esp_err_to_name( err ) );
        return err;
    }

    err = nvs_set_blob( my_handle, key, inputData, len );

    if ( ESP_OK != err ) {
        ESP_LOGE( TAG, "Error (%s) saving <inputData> blob to NVS!\n", esp_err_to_name( err ) );
        return err;
    }

    err = nvs_commit(my_handle);
    if ( ESP_OK != err ) {
        ESP_LOGE( TAG, "Error (%s) committing updates in NVS!\n", esp_err_to_name( err ) );
        return err;
    }

    nvs_close( my_handle );
    return ESP_OK;
}
/*============================================================================*/
int32_t getDataBlockRawFromNvs( const char *key, void *output, size_t len )
{
    NVS_HDLR my_handle;
    
    esp_err_t err = nvs_open( STORAGE_NAMESPACE, NVS_READWRITE, &my_handle );
    if ( ESP_OK != err ) {
        ESP_LOGE( TAG, "Error (%s) opening NVS handle!", esp_err_to_name( err ) );
        return err;
    }

    err = nvs_get_blob( my_handle, key , NULL, &len );
    if ( ( ESP_OK != err )  && ( ESP_ERR_NVS_NOT_FOUND != err ) ) {
        ESP_LOGE( TAG, "Error (%s) reading data from NVS!", esp_err_to_name( err ) );
        return err;
    }
    
    if ( len > 0u ) {
        err = nvs_get_blob( my_handle, key, output, &len );
    }

    if ( ESP_OK != err ) {
        ESP_LOGE( TAG, "Error (%s) reading data from NVS!", esp_err_to_name( err ) );
        return err;
    }

    nvs_close( my_handle );
    return ESP_OK;
}
/*============================================================================*/
