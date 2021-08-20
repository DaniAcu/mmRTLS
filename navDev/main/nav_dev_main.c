/* Hello World Example

   This example code is in the Public Domain (or CC0 licensed, at your option.)

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/
#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "../src/systemInfo.h"
#include "../src/nvsRegistry.h"
#include "../src/RSSIData.h"
#include "../src/scanner.h"
#include "../src/mqttClient.h"
#include "../src/wifiHandler.h"
#include "../src/sntpUpdate.h"

#include "wifiConfig.h"

#include "wtd.h"

void app_main() {
   
   //Boot Information
   printResetInfo();
   printChipInfo();
   wtdInitTask(10);
    //Initializations
   int32_t errorCode = initializeNVSRegistry();
   if (errorCode != ESP_OK) {
      printf("NVS Registry Error: %d", errorCode);
   }

   //Read Mode from configuration
   //TBD
   QueueHandle_t rssiMessageQueue = createRSSIDataMessageQueue(WIFI_RSSIDATA_QUEUE_SIZE);
   
   //Start Tasks
   wifiHandlerStart(WIFI_CHANNEL_MAX, wifiScannerPacketHandler);
   wifiScannerStart(WIFI_CHANNEL_MAX, WIFI_SCAN_TIME_MS_BTW_CH, rssiMessageQueue, wifiHandlerGetEventGroup());
   mqttClientStart( rssiMessageQueue, wifiHandlerGetEventGroup() );
   sntpUpdateStart( wifiHandlerGetEventGroup() );
}
