# mmRTLS Navigation Device

FreeRTOS based implementation of a Navigation device to run in ESP based devices.
By setting the device family on the IDF, the build options will change to manage the available modes.

# Main components
![image](https://user-images.githubusercontent.com/5400635/116485484-b82a3500-a861-11eb-9d43-a35ba54991ec.png)

Scanner: 
- Starts the wifi promiscuous listening mode
- Start a task that cycles between channels
- Sends processed RSSI data into a queue


Msg Processor: process raw packets from wifi and returns mac & RSSI data


MQTT CLient: listen for new RSSI data and based on configured criteria packs a bundle of packets and sends it to a topic

Connection handler, resolves wifi connection as a client to an Access Point

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
    ```
    export IDF_PATH=$HOME/esp/esp-idf
    export IDF_TOOL_PATH=$HOME/esp/xtensa-lx106-elf/bin:$IDF_PATH/tools
    ```
    
5. Get requirements:
    `python -m pip install --user -r $IDF_PATH/requirements.txt`

# Configure
```idf.py menuconfig```

Remember to set your desired desired bitrate on the MONITOR_BAUD, if not defaults to 74880

# Build
```idf.py build```

# Flash
```idf.py flash```

# MQTT configuration topics
## Known node list

Just publish a JSON array named `beacons` enumerating the MAC address of each kwown beacon. Should look like this:

Target topic: `/topictest/beacon_list`

```json
{
  "beacons": [
    "FC:52:8D:75:C6:96",
    "AC:20:2E:E0:BB:28",
    "4C:6E:6E:F5:C0:DC",
    "4C:6E:6E:F5:C0:D4"
  ]
}
```

##  AP credentials list

Just publish a JSON array named `ap_credentials` relating the MAC of each AP with its respective password.. Should look like this:

Target topic: `/topictest/cred_list`

```json
{
    "ap_credentials": [
        {
            "mac": "C0:89:AB:AC:A2:B9",
            "pwd": "my_secret_pass"
        },
        {
            "mac": "4C:6E:6E:F9:30:14",
            "pwd": "password1"
        },
        {
            "mac": "4C:6E:6E:F9:30:1C",
            "pwd": "complex_password"
        }
    ]
}

```

