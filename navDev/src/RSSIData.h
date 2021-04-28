#ifndef  RSSIDATA_H
#define  RSSIDATA_H

typedef struct 
{
  uint8_t mac[6];       /* Mac address */
  char    rssi;         /* rssi power in dbm */
  char    channel;      /* the channel where the mac is located */
  bool    isValid;      /* the object is Valid */
} rssiData_t;

#define createRSSIDataMessageQueue(queueSize) xQueueCreate( queueSize, sizeof( rssiData_t ))

#endif //RSSIDATA_H
