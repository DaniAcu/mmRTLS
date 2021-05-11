idf_component_register(SRCS "nav_dev_main.c" ../src/scanner.c ../src/systemInfo.c   ../src/nvsRegistry.c ../src/packetProcessor.c 
                                            ../src/mqttClient.c ../src/wifiHandler.c
    INCLUDE_DIRS "../src" ../config )