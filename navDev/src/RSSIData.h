#ifndef  RSSIDATA_H
#define  RSSIDATA_H

#ifdef __cplusplus
extern "C" {
#endif

    #include "ieee80211_structs.h"

    typedef struct 
    {
        uint8_t   mac[ MAC_ADDR_LENGTH ];       /* Mac address */
        int8_t    rssi;         /* rssi power in dbm */
        uint8_t   channel;      /* the channel where the mac is located */
        bool      isValid;      /* the object is Valid */
        uint64_t  timestamp;    /* local unix time*/
    } rssiData_t;

    #define createRSSIDataMessageQueue(queueSize) xQueueCreate( queueSize, sizeof( rssiData_t ))

#ifdef __cplusplus
}
#endif

#endif //RSSIDATA_H
