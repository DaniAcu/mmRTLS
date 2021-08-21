#ifndef  NVSREGISTRY_H
#define  NVSREGISTRY_H

#ifdef __cplusplus
extern "C" {
#endif

    #include <stdint.h>

    typedef enum  
    {
        NvsRegistryDataType8,
        NvsRegistryDataType16,
        NvsRegistryDataType32,
        NvsRegistryDataType64,
        NvsRegistryDataTypeStr
    } NvsRegistryDataType;

    #define NVS_EMPTY_BYTE  ( 0xFF )
    #define NVS_EMPTY_DWORD ( 0xFFFFFFFF )

    int32_t initializeNVSRegistry( void );
    int32_t getValueFromNVSRegistry( const char *key, void *outValue, NvsRegistryDataType dataType, size_t length );
    int32_t setValueToNVSRegistry( const char *key, void *inValue, NvsRegistryDataType dataType );
    int32_t getDataBlockRawFromNvs( const char *key, void *output, size_t len );
    int32_t setDataBlockRawToNvs( const char *key, void *input, size_t len );

#ifdef __cplusplus
}
#endif

#endif //NVSREGISTRY_H