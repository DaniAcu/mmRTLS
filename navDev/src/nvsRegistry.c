#include <stddef.h>

#include "nvsRegistry.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "nvs.h"
// Documentation:
// https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/storage/nvs_flash.html

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

int32_t getValueFromNVSRegistry(const char *key, void *outValue, NvsRegistryDataType dataType, size_t length) {
    nvs_handle handle;
    esp_err_t err = nvs_open("navDevData", NVS_READONLY, &handle);
    if (err != ESP_OK) {
         printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
        return err;
    } 

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
            err = nvs_get_str(handle, key, outValue, &length);
            break;
    }

    return err;
}

int32_t setValueToNVSRegistry(const char *key, void *inValue, NvsRegistryDataType dataType)
{
    //TBD
    return ESP_OK;
}