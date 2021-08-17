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
        this.onConnectedListeners = []
        this.mqttClient = null
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
        let self = this
        mqttClient.on("connect",function() {	
            if (self.onConnectedListeners.length > 0) {
                self.onConnectedListeners.forEach(listener => {
                    listener(mqttClient.connected)
                });                
            }

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

    listenOnConnected(callback) {
        this.onConnectedListeners.push(callback)
    }

    publish(topic, message, isJson, isPersistent) {
        if (!this.mqttClient.connected) {
            appLog("publish to " + topic + ": MQTT  is not connected" + error)
            return -1
        }
        if (isJson == null || isJson == true) {
            message = JSON.stringify(message)
        }
        appLog("publishing to " + topic + ", payload = " + message)
        let options = { retain: isPersistent}
        this.mqttClient.publish(topic, message, options)
    }

    disconnect() {
        this.mqttClient.end()
    }
}

export { MqttController } 