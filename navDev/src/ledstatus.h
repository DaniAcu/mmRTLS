#ifndef LED_STATUS_H
#define LED_STATUS_H

#ifdef __cplusplus
extern "C" {
#endif

    #include <stdint.h>

    void ledStatusInit( uint8_t xPin );
    void ledStatusSetBlinkSpeed( const uint32_t t ); 

#ifdef __cplusplus
}
#endif

#endif