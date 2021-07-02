import { MeasuredBeacon } from './measuredBeacon.js'

class NavDevData { 
    constructor(navdevMac, measuredBeaconsIn) {
        if (!typeof navdevMac == "string") {
            throw new Error('first parameter is not a string')
        }
        if (!Array.isArray(measuredBeaconsIn)) {
            throw new Error('second parameter is not an array of Beacons')
        }
        let measuredBeaconsOut = []
        measuredBeaconsIn.forEach(measuredBeacon => {
            measuredBeaconsOut.push(new MeasuredBeacon(measuredBeacon.mac, measuredBeacon.channel, measuredBeacon.rssi, measuredBeacon.timestamp))      
        });

        this.navDevMac = navdevMac
        this.measuredBeacons = measuredBeaconsOut
    }

    toString() {
        return JSON.stringify(this)
    }
    
    static fromJson(str) {
        let obj = JSON.parse(str)
        
        return new NavDevData(obj.navDevMac, obj.Beacons)
    }
}

export { NavDevData }