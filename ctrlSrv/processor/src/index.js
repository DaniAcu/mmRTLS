import nconf from 'nconf'
import { appLog }           from './helpers/logger.js'
import { ConditionEvent, ConditionEvaluator }  from './helpers/conditionEvaluator.js'
import { DbController }     from './controllers/dbController.js'
import { MqttController }   from './controllers/mqttController.js'
import { RssiController }   from './controllers/rssiController.js'
import { BeaconController } from './controllers/beaconController.js'

function publishBeacons(mqttController, topic, beacons) {
    let beaconList = []
    beacons.forEach(element => {
        beaconList.push(element.mac)
    });
    let payload = { "beacons" : beaconList }

    mqttController.publish(topic, payload, true)
}

function main() {
    //Getting app configuration
    nconf.use('file', { file: './config/appConfig.json' })
    nconf.load()

    //App Name
    const appClientId = nconf.get('appName')

    //Data Base
    const mariaDbIp    = nconf.get('mysql:ip')
    const mariaDbPort  = nconf.get('mysql:port')
    const mariaDbUser  = nconf.get('mysql:user')
    const mariaDbPass  = nconf.get('mysql:pass')
    const mariaDbDataBase = nconf.get('mysql:dbName')
    const watcherRefreshMs = nconf.get('mysql:watcher:refreshMs')

    //Create dataBase controller with db information
    let dbController = new DbController(
        mariaDbIp,
        mariaDbPort,
        mariaDbUser,
        mariaDbPass,
        mariaDbDataBase,
        watcherRefreshMs
    )

    //Setting environment constants MQTT
    const mqttIp   = nconf.get('mqtt:ip')
    const mqttPort = nconf.get('mqtt:port')
    const mqttUser = nconf.get('mqtt:user')
    const mqttPass = nconf.get('mqtt:pass')

    //Topics
    const mqttTopicRSSI   = nconf.get('mqtt:topics:rssi')
    const mqttTopicBeacons = nconf.get('mqtt:topics:beacons')

    //Pass to the RSSI controller the dbController
    let rssiController = new RssiController(dbController)

    //Define known topics and their handlers
    let mqttTopicHandlers = {
        [mqttTopicRSSI]: rssiController.onRSSIMessage.bind(rssiController)
    }

    //Create the MQTT Controller
    let mqttController = new MqttController(
        mqttIp,
        mqttPort,
        mqttUser,
        mqttPass,
        appClientId,
        mqttTopicHandlers
    )

    // Beacons information
    let beacons = []
   
    let conditionEvaluator = new ConditionEvaluator(() => {
        publishBeacons(mqttController, mqttTopicBeacons, beacons)
    })
    //When both conditions are met invoke callback
    let eventDB = new ConditionEvent(conditionEvaluator)
    let eventMQTT = new ConditionEvent(conditionEvaluator)

    //Pass to the Beacon controller the dbController
    let beaconController = new BeaconController(dbController)

    dbController.listenOnConnected(async () => {
        beacons = await beaconController.getBeacons()
        rssiController.setBeacons(beacons)
        eventDB.triggerSuccess()
    })

    dbController.addWatcher("Beacon", async () => {
        appLog("Beacons Changed")
        beacons = await beaconController.getBeacons(true)
        rssiController.setBeacons(beacons)
        publishBeacons(mqttController, mqttTopicBeacons, beacons)
    })
    
    mqttController.listenOnConnected(async (isConnected) => {
        appLog("MQTT Connected = " + isConnected)
        if (isConnected) {
            eventMQTT.triggerSuccess()
        }
    })

    mqttController.connect()
    
    process.on('SIGINT', function() {
        appLog("Caught interrupt signal, closing ")
        mqttController.disconnect()
        process.exit()
    })
}

//Start the main app
main()