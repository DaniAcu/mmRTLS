#ifndef RSSI_FILTER_H
#define RSSI_FILTER_H

#ifdef __cplusplus
extern "C" {
#endif

    #include <stdio.h>
    #include <stdlib.h>
    #include <stdint.h>
    #include <string.h>
    #include <math.h>


    #ifndef RSSI_FILTER_WINDOW_SIZE
        #define RSSI_FILTER_WINDOW_SIZE      ( 3 )
    #endif

    #define RSSI_FILTER_DEFAULT_ALFA         ( 0.7f )

    typedef enum{
        RSSI_FILTER_MODE_NONE,
        RSSI_FILTER_MODE_LPF1,
        RSSI_FILTER_MODE_LPF2,
        RSSI_FILTER_MODE_RMOW,
    }rssiFilterMode_t;

    typedef struct rssiFilter_s{
        int8_t (*filtFcn)( struct rssiFilter_s *f, int8_t s ); 
        uint8_t mode;
        int8_t w[ RSSI_FILTER_WINDOW_SIZE ];
        float alfa, fo_1, fo_2, u_1, u_2;
        float k, a1, a2, b1;
        uint8_t init;
        int8_t m;
    }rssiFilter_t;

    #define RSSI_FILTER_INITIALIZER     { NULL, RSSI_FILTER_MODE_NONE, {0}, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0u, 0 }

    int rssiFilterIsInitialized( rssiFilter_t *f );
    void rssiFilterReset( rssiFilter_t *f );
    int rssiFilterInit( rssiFilter_t *f , rssiFilterMode_t mode, float alfa );
    int8_t rssiFilterPerform( rssiFilter_t *f, int8_t s );

#ifdef __cplusplus
}
#endif

#endif