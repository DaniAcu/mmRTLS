# Node RSSI Processor through MQTT
This app connects to an MQTT broker, listens to information from navDev Topic, process RSSI data and generates trilateration information.

# Setup
Configure the application by modifying appConfig.json in config folder
```
{
    "appName" : "node-rssi-processor",
    "mqtt" : {
        "ip": "192.168.1.28",
        "port": 1883,
        "user": null,
        "pass": null,
        "topics" : {
            "rssi" : "/topictest/macrssi_data",
            "config" : "/topictest/config"
        }
    },
    "mysql": {
        "ip" : "192.168.1.28",
        "port" : 3306,
        "user" : "globcol",
        "pass" : "RMVnTbQ7wF",
        "table" : "mmRTLS"
    },
    "beacons" : [
        { "mac": "C0:25:67:BD:F8:B1", "name": "Nexxt", "x": 5, "y": 7, "tssi": 20 },
        { "mac": "F0:81:75:1F:F2:63", "name": "Sagemcom", "x": 9, "y": 0, "tssi": 20 },
        { "mac": "70:56:81:CD:41:EB", "name": "Apple", "x": 0, "y": 0, "tssi": 20 }
    ],
    "parsing" : {
        "sortByTime" : false,
        "filterByKnowBeacons" : true
    }
}
```

# Install
Just do npm install

# Test
Just do npm test

# Run 
Just do npm start

# Dry run
With the initial config:

1. Use the rest beacon api and post each beacon information to http://<url>:3000/beacons
```
POST 1:
{
  "mac": "C0:25:67:BD:F8:B1",
  "name": "Nexxt",
  "x": 0,
  "y": 0,
  "tssi": 20,
  "channel": 1
}

POST 2:
{
  "mac": "F0:81:75:1F:F2:63",
  "name": "Sagemcom",
  "x": 5,
  "y": 7,
  "tssi": 20,
  "channel": 1
}

POST 3:
{
  "mac": "70:56:81:CD:41:EB",
  "name": "Apple",
  "x": 9,
  "y": 0,
  "tssi": 20,
  "channel": 1
}
```

2. publish to ´rssi´ topic the following test json
```
{
    "navDevMac": "AA::BB:CC:DD:EE:FF",
    "Beacons":
    [
        {
            "mac": "C0:25:67:BD:F8:B1",  
            "channel": 2,
            "rssi": -34.853250810165676,
            "timestamp": 1623887621
        },
        {
            "mac": "F0:81:75:1F:F2:63",  
            "channel": 5,
            "rssi": -30.148996586678926,
            "timestamp": 1623887622
        },
        {
            "mac": "70:56:81:CD:41:EB", 
            "channel": 5,
            "rssi": -34.853250810165676,
            "timestamp": 1623887622
        },
        {
            "mac": "10:10:10:10:10:10",
            "channel": 5,
            "rssi": -40,
            "timestamp": 1623887622
        }
    ]
}
```
It should store the aprox position (4.7 , 3) to the device MAC "AA::BB:CC:DD:EE:FF"



