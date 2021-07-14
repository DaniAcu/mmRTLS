#ifndef  MESSAGEBUNDLER_H
#define  MESSAGEBUNDLER_H

    #include <stdio.h>
    #include <string.h>
    #include <stdint.h>
    #include <stdlib.h>
    #include <stdbool.h>

    #include "RSSIData.h"
    #include "cJSON.h"

    #define MESSAGEBUNDLER_ENTITY_INITIALIZER      { NULL, NULL, NULL } 

    typedef struct {
        char *MACstr;
        cJSON *root;
        cJSON *array;
    }messageBundlerEntity_t;

    typedef void (*messageBundlerPublisher_t)( char *, void * );


    int messageBundlerInsert( messageBundlerEntity_t* pEntity, rssiData_t *pData );
    void messageBundlerCleanup( messageBundlerEntity_t* pEntity );
    int messageBundlerPublish( messageBundlerEntity_t* pEntity, messageBundlerPublisher_t publisherFcn, void *arg );

#endif /*MESSAGEBUNDLER_H*/
