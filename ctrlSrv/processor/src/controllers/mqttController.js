import mqtt       from 'mqtt'
import { appLog } from '../helpers/logger.js'

class MqttController { 
    constructor(ip, port, user, pass, clientId, topicHandler) {
        this.ip = ip
        this.port = port
        this.user = user
        this.pass = pass
        this.clientId = clientId
        this.topicHandler = topicHandler
    }

    connect() {
        let mqtturl = "mqtt://" + this.ip
        let mqttConnectionOptions = {
            port:     this.port,
            clientId: this.clientId
        }
        
        if (this.user !== '') {
            mqttConnectionOptions.username = this.user
        }
        
        if (this.pass !== '') {
            mqttConnectionOptions.password = this.pass
        }
        
        appLog("Connecting MQTT to " + mqtturl + " with options " + JSON.stringify(mqttConnectionOptions))
        
        let mqttClient = mqtt.connect(mqtturl, mqttConnectionOptions)
        let topicHandler = this.topicHandler

        mqttClient.on("connect",function() {	
            appLog("Mqtt connected = " + mqttClient.connected)
            let subscriptionOptions = {
                qos:1
            }
                       
            let mqttTopicListeningList = Object.keys(topicHandler)
        
            appLog("Subscribing to " + mqttTopicListeningList)
            mqttClient.subscribe(mqttTopicListeningList, subscriptionOptions, function (err) {
                if (err) {
                    appLog("Could not subscribe to topic, error"  + error)
                }
            })
        
            mqttClient.on("message", (topic, message, packet) => {
                if (!topicHandler.hasOwnProperty(topic)) {
                    appLog("Message from topic " + topic + " is not handled")
                    return
                }
            
                topicHandler[topic](message)
            })
        })
        
        mqttClient.on("error", function(error) { 
            appLog("Can't connect " + error)
        })
        
        this.mqttClient = mqttClient
    }

    disconnect() {
        this.mqttClient.end()
    }
}

export { MqttController } 