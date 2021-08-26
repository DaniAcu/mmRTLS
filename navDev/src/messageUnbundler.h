#ifndef  MESSAGEUNBUNDLER_H
#define  MESSAGEUNBUNDLER_H

#ifdef __cplusplus
extern "C" {
#endif

    #include <stdio.h>
    #include <string.h>
    #include <stdint.h>
    #include <stdlib.h>
    #include <stdbool.h>
    #include "cJSON.h"

    int messageUnbundlerRetrieveKnownNodes( char *incoming );
    int messageUnbundlerRetrieveCredenditals( char *incoming );

#ifdef __cplusplus
}
#endif

#endif /*MESSAGEUNBUNDLER_H*/
