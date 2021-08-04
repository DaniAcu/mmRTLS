#ifndef PROCESSOR_CONFIG_H
#define PROCESSOR_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif

    #define CONFIG_PROCESSOR_MAXKNOWN_NODES                  ( 32 )
    #define MAXKNOWN_NODES_LIST_SIZE                         ( CONFIG_PROCESSOR_MAXKNOWN_NODES * 6 )
    #define CONFIG_PROCESSOR_PERSISTENT_KNOWN_NODES          ( 1 )

#ifdef __cplusplus
}
#endif 

#endif/*PROCESSOR_CONFIG_H*/
