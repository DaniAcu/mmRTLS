#ifndef SNTP_UPDATE_H
#define SNTP_UPDATE_H

#ifdef __cplusplus
extern "C" {
#endif

    #include <time.h>
    #include <sys/time.h>

    #define CONFIG_SNTP_OPERATING_MODE      ( SNTP_OPMODE_POLL )
    #define CONFIG_SNTP_SERVER_NAME         "pool.ntp.org"    

    void sntpUpdateStart( EventGroupHandle_t eventGroup );
    void sntpUpdateRequestSync( void );

#ifdef __cplusplus
}
#endif 

#endif/*SNTP_UPDATE_H*/

