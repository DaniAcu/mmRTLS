#include "packetProcessor.h"
#include "esp_libc.h"

typedef struct 
{
  unsigned frame_ctrl:16;
  unsigned duration_id:16;
  uint8_t addr1[6]; /* receiver address */
  uint8_t addr2[6]; /* sender address */
  uint8_t addr3[6]; /* filtering address */
  unsigned sequence_ctrl:16;
  uint8_t addr4[6]; /* optional */
} __attribute__((packed)) wifi_ieee80211_mac_hdr_t;

typedef struct 
{
  wifi_ieee80211_mac_hdr_t hdr;
  uint8_t payload[0]; /* network data ended with 4 bytes csum (CRC32) */
} __attribute__((packed)) wifi_ieee80211_packet_t;

rssiData_t processWifiPacket(const wifi_pkt_rx_ctrl_t *crtPkt, const uint8_t *payload)
{
    int len = crtPkt->sig_mode ? crtPkt->HT_length : crtPkt->legacy_length;
    rssiData_t rssiData = {
        
    };

    if (len < sizeof(wifi_ieee80211_mac_hdr_t)) {
        rssiData.isValid = false;
        return rssiData;
    }

    wifi_ieee80211_packet_t  *ipkt = (wifi_ieee80211_packet_t *) payload;
    wifi_ieee80211_mac_hdr_t *hdr = &ipkt->hdr;

    rssiData.rssi = crtPkt->rssi;
    rssiData.channel = crtPkt->channel;
    rssiData.isValid = true;
    for (int i=0; i<6; i++) {
      rssiData.mac[i] = hdr->addr2[i];
    }

    return rssiData;
}


    