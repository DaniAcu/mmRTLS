#ifndef _IEE80211_STRUCTS_H_
#define _IEE80211_STRUCTS_H_

#ifdef __cplusplus
extern "C" {
#endif

    #include <stdint.h>
    #include "esp_wifi.h"
    #include "esp_wifi_types.h"


    #define MAC_ADDR_LENGTH     ( 6 )     

    typedef enum
    {
        ASSOCIATION_REQ,
        ASSOCIATION_RES,
        REASSOCIATION_REQ,
        REASSOCIATION_RES,
        PROBE_REQ,
        PROBE_RES,
        NU1,  /* ......................*/
        NU2,  /* 0110, 0111 not used */
        BEACON,
        ATIM,
        DISASSOCIATION,
        AUTHENTICATION,
        DEAUTHENTICATION,
        ACTION,
        ACTION_NACK,
    } wifi_mgmt_subtypes_t;

    typedef struct
    {
        unsigned interval:16;
        unsigned capability:16;
        unsigned tag_number:8;
        unsigned tag_length:8;
        char ssid[ 0 ];
        uint8_t rates[1];
    } wifi_mgmt_beacon_t;

    typedef struct
    {
        unsigned protocol:2;
        unsigned type:2;
        unsigned subtype:4;
        unsigned to_ds:1;
        unsigned from_ds:1;
        unsigned more_frag:1;
        unsigned retry:1;
        unsigned pwr_mgmt:1;
        unsigned more_data:1;
        unsigned wep:1;
        unsigned strict:1;
    } wifi_header_frame_control_t;

    typedef struct
    {
        wifi_header_frame_control_t frame_ctrl;
        //unsigned duration_id:16; /* !!!! ugly hack */
        uint8_t addr1[ MAC_ADDR_LENGTH ]; /* receiver address */
        uint8_t addr2[ MAC_ADDR_LENGTH ]; /* sender address */
        uint8_t addr3[ MAC_ADDR_LENGTH ]; /* filtering address */
        unsigned sequence_ctrl:16;
        uint8_t addr4[ MAC_ADDR_LENGTH] ; /* optional */
    } wifi_ieee80211_mac_hdr_t;

    typedef struct
    {
        wifi_ieee80211_mac_hdr_t hdr;
        uint8_t payload[ 2 ]; /* network data ended with 4 bytes csum (CRC32) */
    } wifi_ieee80211_packet_t;

#ifdef __cplusplus
}
#endif

#endif

