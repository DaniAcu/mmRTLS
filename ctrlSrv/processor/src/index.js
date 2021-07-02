import nconf from 'nconf'
import { appLog }         from './helpers/logger.js'
import { MqttController } from './controllers/mqttController.js'
import { RssiController } from './controllers/rssiController.js'

function main() {
    //Getting app configuration
    nconf.use('file', { file: './config/appconfig.json' })
    nconf.load()

    //App Name
    const appClientId = nconf.get('appName')

    //Data Base
    const mariaDbIp    = nconf.get('mysql:ip')
    const mariaDbPort  = nconf.get('mysql:port')
    const mariaDbUser  = nconf.get('mysql:user')
    const mariaDbPass  = nconf.get('mysql:pass')
    const mariaDbDataBase = nconf.get('mysql:table')

    //Pass to the RSSI controller the mysql database information
    let rssiController = new RssiController(
        mariaDbIp,
        mariaDbPort,
        mariaDbUser,
        mariaDbPass,
        mariaDbDataBase
    )

    //Setting environment constants MQTT
    const mqttIp   = nconf.get('mqtt:ip')
    const mqttPort = nconf.get('mqtt:port')
    const mqttUser = nconf.get('mqtt:user')
    const mqttPass = nconf.get('mqtt:pass')

    //Topics
    const mqttTopicRSSI   = nconf.get('mqtt:topics:rssi')
    const mqttTopicConfig = nconf.get('mqtt:topics:config')

    //Define known topics and their handlers
    let mqttTopicHandlers = {
        [mqttTopicRSSI]: rssiController.onRSSIMessage.bind(rssiController)
    }

    let mqttController = new MqttController(
        mqttIp,
        mqttPort,
        mqttUser,
        mqttPass,
        appClientId,
        mqttTopicHandlers
    )

    // Beacons information
    let beaconInfo = nconf.get('beacons')
    rssiController.setBeacons(beaconInfo)

    mqttController.connect()
    
    process.on('SIGINT', function() {
        appLog("Caught interrupt signal, closing ")
        mqttController.disconnect()
        process.exit()
    })
}

//Start the main app
main()