#ifndef  PACKETPROCESSOR_H
#define  PACKETPROCESSOR_H

#include "esp_wifi.h"
#include "RSSIData.h"


rssiData_t processWifiPacket(const wifi_pkt_rx_ctrl_t *crtPkt, const uint8_t *payload);

#endif //PACKETPROCESSOR_H
