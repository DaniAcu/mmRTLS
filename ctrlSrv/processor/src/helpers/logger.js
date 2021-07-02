import nconf from 'nconf'
//Getting app configuration
nconf.use('file', { file: './config/appconfig.json' })
nconf.load()

//Settings App
const appClientId = nconf.get('appName')

function appLog(msg) {
    let timestamp = new Date().toLocaleTimeString()
    console.log(timestamp + " [" + appClientId + "] " + msg)
}

export { appLog }