#ifndef  PACKETPROCESSOR_H
#define  PACKETPROCESSOR_H

#include "esp_wifi.h"
#include "processorConfig.h"
#include "RSSIData.h"


rssiData_t processWifiPacket(const wifi_pkt_rx_ctrl_t *crtPkt, const uint8_t *payload);
uint8_t* processGetListOfKnown( void );
int processKnownListStore( uint8_t *list );
int processKnownListLoad( void );

#endif //PACKETPROCESSOR_H
