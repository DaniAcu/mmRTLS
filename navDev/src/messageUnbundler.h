#ifndef  MESSAGEUNBUNDLER_H
#define  MESSAGEUNBUNDLER_H

    #include <stdio.h>
    #include <string.h>
    #include <stdint.h>
    #include <stdlib.h>
    #include <stdbool.h>
    #include "cJSON.h"

    int messageUnbundlerRetrieveKnownNodes( char *incoming );
    int messageUnbundlerRetrieveCredenditals( char *incoming );

#endif /*MESSAGEUNBUNDLER_H*/
