#ifndef  RSSIDATA_H
#define  RSSIDATA_H

typedef struct 
{
    uint8_t   mac[6];       /* Mac address */
    int8_t    rssi;         /* rssi power in dbm */
    uint8_t   channel;      /* the channel where the mac is located */
    bool      isValid;      /* the object is Valid */
    uint64_t  timestamp;    /* local unix time*/
} rssiData_t;

#define createRSSIDataMessageQueue(queueSize) xQueueCreate( queueSize, sizeof( rssiData_t ))

#endif //RSSIDATA_H
