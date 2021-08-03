#include <stddef.h>

#include "nvsRegistry.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "nvs.h"

// Documentation:
// https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/storage/nvs_flash.html


#define STORAGE_NAMESPACE "storage"

int32_t initializeNVSRegistry(void) {
    // Initialize NVS
    esp_err_t err = nvs_flash_init();
    if ((ESP_ERR_NVS_NO_FREE_PAGES == err)) {
        // NVS partition was truncated and needs to be erased, retry nvs_flash_init
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK( err );

    return err;
}

int32_t getValueFromNVSRegistry(const char *key, void *outValue, NvsRegistryDataType dataType, size_t *length) {
    nvs_handle handle;
    esp_err_t err = nvs_open(STORAGE_NAMESPACE,NVS_READONLY , &handle); //NVS_READWRITE
    if (err != ESP_OK) {
         printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
        return err;
    } else {
        printf("Done\n");
        switch (dataType) {
            case NvsRegistryDataType8:
                err = nvs_get_i8(handle, key, outValue);
                break;
            case NvsRegistryDataType16:
                err = nvs_get_i16(handle, key, outValue);
                break;
            case NvsRegistryDataType32:
                err = nvs_get_i32(handle, key, outValue);
                break;
            case NvsRegistryDataType64:
                err = nvs_get_i64(handle, key, outValue);
                break;
            case NvsRegistryDataTypeStr:
                err = nvs_get_str(handle, key, outValue, length);
                break;
        }
        printf((err != ESP_OK) ? "Failed!\n" : "Done\n");
        nvs_close(handle);
    }

    return err;
}

int32_t setValueToNVSRegistry(const char *key, void *inValue, NvsRegistryDataType dataType) {
    //TBD
    nvs_handle handle;
    esp_err_t err = nvs_open(STORAGE_NAMESPACE, NVS_READWRITE, &handle);
    if (err != ESP_OK) {
         printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
        return err;
    }else {
        printf("Done\n");
        switch (dataType) {
            case NvsRegistryDataType8:
                err = nvs_set_u8(handle, key, *((uint8_t*)inValue));
                break;
            case NvsRegistryDataType16:
                err = nvs_set_i16(handle, key, *((int16_t*)inValue));
                break;
            case NvsRegistryDataType32:
                err = nvs_set_i32(handle, key, *((int32_t*)inValue));
                break;
            case NvsRegistryDataType64:
                err = nvs_set_i64(handle, key, *((int64_t*)inValue));
                break;
            case NvsRegistryDataTypeStr:
                err = nvs_set_str(handle, key, (char*)inValue);
                break;
        }
        if (err != ESP_OK) {
            printf("Committing updates in NVS ... ");
            err = nvs_commit(handle);
            printf((err != ESP_OK) ? "Failed!\n" : "Done\n");
        }
        nvs_close(handle);
    }

    return ESP_OK;
}

//saving <inputData> blob to NVS
int32_t setDataBlockRawToNvs(void *input, size_t len, const char *key){
    nvs_handle_t my_handle;
    uint8_t* inputData = (uint8_t*)input;
    
    // open
    esp_err_t err = nvs_open(STORAGE_NAMESPACE, NVS_READWRITE, &my_handle);
    if (err != ESP_OK) {
         printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
        return err;
    }

    err = nvs_set_blob(my_handle, key, inputData, len);

    if (err != ESP_OK) {
        printf("Error (%s) saving <inputData> blob to NVS!\n", esp_err_to_name(err));
        return err;
    }

    // Commit
    err = nvs_commit(my_handle);
    if (err != ESP_OK) {
         printf("Error (%s) committing updates in NVS!\n", esp_err_to_name(err));
        return err;
    }

    // Close
    nvs_close(my_handle);
    return ESP_OK;
}

//blob-read data from NVS
int32_t getDataBlockRawFromNvs(void *output, size_t *len, const char *key){
    nvs_handle_t my_handle;
    
    // open
    esp_err_t err = nvs_open(STORAGE_NAMESPACE, NVS_READWRITE, &my_handle);
    if (err != ESP_OK) {
        printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
        return err;
    }

    err = nvs_get_blob(my_handle, key , NULL, len);
    if (err != ESP_OK && err != ESP_ERR_NVS_NOT_FOUND)  {
        printf("Error (%s) reading data from NVS!\n", esp_err_to_name(err));
        return err;
    }
    // Read 
    if (*len > 0) {
        err = nvs_get_blob(my_handle, key, output, len);
    }

    if (err != ESP_OK) {
        printf("Error (%s) reading data from NVS!\n", esp_err_to_name(err));
        return err;
    }

    // Close
    nvs_close(my_handle);
    return ESP_OK;
}
