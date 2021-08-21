#include "packetProcessor.h"
#include "wifiConfig.h"
#include "utils.h"
#include "esp_log.h"
#include "nvsRegistry.h"
#include <string.h>
#include "ieee80211_structs.h"


static const char *TAG = "packetProcessor";

typedef enum 
{
    KNOWN_LIST_EMPTY = -2,
    KNOWN_LIST_NOT_FOUND = -1, 
} KnownListStatus_t;

static uint8_t knownNodes[ CONFIG_PROCESSOR_MAXKNOWN_NODES*MAC_ADDR_LENGTH  ]= { 0 };
static bool knownChannels[ CONFIG_WIFI_CHANNEL_MAX ] = { 0 };

static int processCheckIfKnown( uint8_t *mac );

/*============================================================================*/
rssiData_t processWifiPacket( const wifi_pkt_rx_ctrl_t *crtPkt, const uint8_t *payload ) 
{

    #if CONFIG_IDF_TARGET_ESP32
        int len = crtPkt->sig_len;
    #else 
        int len = crtPkt->sig_mode ? crtPkt->HT_length : crtPkt->legacy_length;
    #endif

    struct timeval tp;
    KnownListStatus_t ismacknonw = KNOWN_LIST_NOT_FOUND;
    rssiData_t rssiData = { };

    if ( len < sizeof(wifi_ieee80211_mac_hdr_t) ) {
        rssiData.isValid = false;
        return rssiData;
    }

    wifi_ieee80211_packet_t  *ipkt = (wifi_ieee80211_packet_t *) payload;
    wifi_ieee80211_mac_hdr_t *hdr = &ipkt->hdr;    

    gettimeofday( &tp, NULL );
    rssiData.rssi = crtPkt->rssi;
    rssiData.channel = crtPkt->channel;
    rssiData.timestamp = (((uint64_t)tp.tv_sec)*1000)+(tp.tv_usec/1000);
    memcpy( rssiData.mac, hdr->addr2, sizeof(rssiData.mac) );

    ismacknonw = processCheckIfKnown( rssiData.mac ); 
    rssiData.isValid = ( KNOWN_LIST_EMPTY == ismacknonw  || ( ismacknonw >= 0 ) );

    if ( ismacknonw >= 0 ) {
        knownChannels[ rssiData.channel ] = true;
    }
    else if ( KNOWN_LIST_EMPTY != ismacknonw ) {
        char macstr[ 18 ] = { 0 };
        utilsMAC2str( rssiData.mac, macstr, sizeof(macstr)  );
        ESP_LOGI( TAG, "%s ignored", macstr );
    } 

    return rssiData;
}
/*============================================================================*/
static KnownListStatus_t processCheckIfKnown( uint8_t *mac )
{
    int i;
    uint8_t nullentry[MAC_ADDR_LENGTH] = { 0 };
    uint8_t *iEntry;
    for( i = 0; i < CONFIG_PROCESSOR_MAXKNOWN_NODES; ++i ) {
        iEntry = &knownNodes[ i*MAC_ADDR_LENGTH ]; /*get mac entry from the list*/
        if ( 0 == memcmp( iEntry, nullentry, MAC_ADDR_LENGTH ) ) { /*we reach the end of the list?*/
            return (i == 0)? KNOWN_LIST_EMPTY : KNOWN_LIST_NOT_FOUND;
        }
        if ( 0 == memcmp( iEntry, mac, MAC_ADDR_LENGTH ) ) { 
            return i;
        }
  }
  return KNOWN_LIST_NOT_FOUND;
}
/*============================================================================*/
uint8_t* processGetListOfKnown( void )
{
    return knownNodes;
}
/*============================================================================*/
int processKnownListStore( uint8_t *list )
{
    int32_t ret = ESP_ERR_NOT_FOUND;

    ESP_LOGI( TAG, "Saving Known nodes list..." );
    
    #if ( CONFIG_PROCESSOR_PERSISTENT_KNOWN_NODES == 1 )
        ret = setDataBlockRawToNvs( "knownlist" , list, sizeof(knownNodes) );
    #endif

    if( ESP_OK == ret ) {
        ESP_LOGI( TAG, "Known nodes list saved!" );
    }
    else {
        ESP_LOGE( TAG, "{SAVE} Failed" );
    }
    return ret;
}
/*============================================================================*/
int processKnownListLoad( void )
{
    int32_t ret = ESP_ERR_NOT_FOUND;
    
    #if ( CONFIG_PROCESSOR_PERSISTENT_KNOWN_NODES == 1 )
        ret = getDataBlockRawFromNvs( "knownlist", knownNodes, sizeof(knownNodes) );
    #endif
    
    if( ESP_OK == ret ){
        uint32_t emptycheck = NVS_EMPTY_DWORD;
        if( 0 == memcmp( knownNodes, &emptycheck, sizeof(emptycheck) ) ) {
            ESP_LOGI( TAG, "knownlist area  empty, start with an empty list" );
            memset( knownNodes, 0x00, sizeof(knownNodes) );
        }
        ESP_LOGI( TAG, "Known nodes list loaded!" );
    }
    else {
        ESP_LOGE( TAG, "{LOAD} Failed" );
    }
    return ret;
}
/*============================================================================*/   
