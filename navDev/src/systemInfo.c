#include "systemInfo.h"
#include "esp_system.h"
#include "esp_spi_flash.h"
#include "freertos/FreeRTOS.h"

void printChipInfo() {
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);
    printf("Chip Information:\n"
        "\tCores = %d\n"
        "\tRevision = %d\n"
        "\tFlash Memory = %dMB %s\n"
        , chip_info.cores, chip_info.revision, (spi_flash_get_chip_size() / (1024 * 1024)), (chip_info.features & CHIP_FEATURE_EMB_FLASH) ? "embedded" : "external");
}

void printResetInfo() {
   //TBD
}