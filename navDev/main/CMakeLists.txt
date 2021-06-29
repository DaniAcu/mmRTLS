idf_component_register(SRCS "nav_dev_main.c" ../src/scanner.c ../src/systemInfo.c   ../src/nvsRegistry.c ../src/packetProcessor.c 
                                            ../src/mqttClient.c ../src/wifiHandler.c ../src/sntpUpdate.c ../src/utils.c
INCLUDE_DIRS "../src" ../config )

# Only enable to test in ESP32 : this two lines will be removed later
#target_compile_definitions(${COMPONENT_TARGET} PRIVATE "-DTARGET_ESP32")