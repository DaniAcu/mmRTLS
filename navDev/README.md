# mmRTLS Navigation Device

FreeRTOS based implementation of a Navigation device to run in ESP based devices.
By setting the device family on the IDF, the build options will change to manage the available modes.

# Setup
1. Configure properly your toolchain
    https://docs.espressif.com/projects/esp8266-rtos-sdk/en/latest/get-started/macos-setup.html    
2. Download the toolchain:
    Mac: https://dl.espressif.com/dl/xtensa-lx106-elf-gcc8_4_0-esp-2020r3-macos.tar.gz
    Win: tbd
    Place it e.g: $HOME/esp/p/xtensa-lx106-elf
3. Download the ESP SDK:
    https://docs.espressif.com/projects/esp8266-rtos-sdk/en/latest/
    Place it e.g: $HOME/esp/IDF
4. Get your IDF Paths:
    export IDF_PATH=$HOME/esp/esp-idf
    export IDF_TOOL_PATH=$HOME/esp/xtensa-lx106-elf/bin:$IDF_PATH/tools
5. Get requirements:
    ´python -m pip install --user -r $IDF_PATH/requirements.txt´

# Configure
idf.py menuconfig 
Remember to set your desired desired bitrate on the MONITOR_BAUD, if not defaults to 74880

# Build
idf.py build

# Flash
idf.py flash