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

    #define RSSI_FILTER_DEFAULT_ALFA         ( 0.8f )   /*  [ 0 < alfa < 1 ] */

    typedef enum{
        RSSI_FILTER_MODE_NONE,
        RSSI_FILTER_MODE_LPF1,  /*1st order low-pass filter alfa = exp(-Tm*fc)*/
        RSSI_FILTER_MODE_LPF2,  /*2nd order low-pass filter with Butterworth characteristic alfa = tan( pi*fc*Tm )*/
        RSSI_FILTER_MODE_RMOW,  /*Sliding window-mean for outlier removal. A sample x(k) is outlier if |M-x(k)| > alfa*|M|. Any outlier is replaced by the dynamic-mean M */
    }rssiFilterMode_t;

    typedef struct rssiFilter_s{
        int8_t (*filtFcn)( struct rssiFilter_s *f, int8_t s ); 
        uint8_t mode, init;
        float alfa;                             /*filter tune parameter*/
        int8_t m, w[ RSSI_FILTER_WINDOW_SIZE ]; /*RMOW parameters*/
        float fo_1;                             /*LPF1 parameters*/
        float k, a1, a2, b1, fo_2, u_1, u_2;    /*LPF2 parameters*/                            
    }rssiFilter_t;

    #define RSSI_FILTER_INITIALIZER     { NULL, RSSI_FILTER_MODE_NONE, 0u, 0.0f, 0, {0}, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f }

    int rssiFilterIsInitialized( rssiFilter_t *f );
    void rssiFilterReset( rssiFilter_t *f );
    int rssiFilterInit( rssiFilter_t *f , rssiFilterMode_t mode, float alfa );
    int8_t rssiFilterPerform( rssiFilter_t *f, int8_t s );

#ifdef __cplusplus
}
#endif

#endif