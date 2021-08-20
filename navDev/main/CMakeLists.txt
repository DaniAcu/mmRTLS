idf_component_register(SRCS "nav_dev_main.c" ../src/scanner.c ../src/systemInfo.c   ../src/nvsRegistry.c ../src/packetProcessor.c 
                                            ../src/mqttClient.c ../src/wifiHandler.c ../src/sntpUpdate.c ../src/utils.c
                                            ../src/messageBundler.c ../src/messageUnbundler.c ../src/wtd.c
INCLUDE_DIRS "../src" ../config )
