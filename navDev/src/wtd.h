#ifndef WTD_H_
#define WTD_H_

#ifdef __cplusplus
extern "C" {
#endif

    #include "stdint.h"
    #include "esp_task_wdt.h"

    void wtdInitTask( uint32_t xTime );
    void wtdSubscribeTask( void );
    void wtdFeed( void );

#ifdef __cplusplus
}
#endif

#endif