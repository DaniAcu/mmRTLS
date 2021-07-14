import { appLog }     from '../helpers/logger.js'
import { DbController } from '../controllers/dbController.js'
import { NavDevData } from '../models/navDevData.js'
import { NavDev } from '../models/navDev.js'
import { Beacon } from '../models/beacon.js'
import { Point } from '../models/point.js'
import { PointResolver } from '../models/pointResolver.js'

class RssiController { 
    constructor(dbController) {
        this.dbController = dbController
        this.knownNavDevs = new Map()
        this.beacons = new Map()
    }

    setBeacons(beacons) {
        this.beacons = new Map()
        beacons.forEach(beaconIn => {           
            this.beacons.set(beaconIn.mac, beaconIn)
        })
        appLog("Inserted " + this.beacons.size + " beacons")
    }

    async getNavDevId(mac) {
        if (this.knownNavDevs.has(mac)) {
            appLog("getNavDevId: Using cache")
            return this.knownNavDevs.get(mac)
        }

        try {
            let result = await this.dbController.queryPromise("SELECT * FROM navDev WHERE macAddress = ? LIMIT 1", [mac]) 
            if (result[0] === undefined) {
                return 0
            } else {
                let navId = result[0].navId
                this.knownNavDevs.set(mac, navId)
                return navId
            }
        } catch (error) {
            appLog("MySQL query failed " + error)
            return -1
        }     
    }

    async storeNavDev(navDev) {
        try {
            let result = await this.dbController.queryPromise("INSERT INTO NavDev (macAddress, onboardingDate, lastConnected) VALUES (?,?,?)",
                [navDev.mac, navDev.onboardingDate, navDev.lastConnected])
            this.knownNavDevs.set(navDev.mac, result.insertId)
            appLog("Stored new NavDev with mac " + navDev.mac + " and id " + result.insertId)
        } catch (error) {
            appLog("MySQL query failed " + error)            
        }  
    }

    async storePosition(mac, point, time) {
        let navId = await this.getNavDevId(mac)
        if (navId < 0) {
            appLog("No associated ID for mac " + mac)
            return 
        }
        try {
            let result = await this.dbController.queryPromise("INSERT INTO `Position` (x, y, time, navId) VALUES (?,?,?,?)",
                [point.x, point.y, time, navId])
            //@TODO: update NavDev with lastConnected
           
            appLog("Stored new position " + point + " for mac " + mac + "(" + navId + ") with posId " + result.insertId)
        } catch (error) {
            appLog("MySQL query failed " + error)            
        } 
    }

    async onRSSIMessage(message) {
        let navData = NavDevData.fromJson(message)
        //1. Get NavDev Mac
        appLog("RSSI Message received from " + navData.navDevMac)

        //2. Get uniqueId from navDev MAC
        let navDevId = await this.getNavDevId(navData.navDevMac)
        if (navDevId == 0) {
            appLog("NavDev Mac " + navData.navDevMac + " is a new navdev")
            this.storeNavDev(new NavDev(navData.navDevMac, new Date(), new Date()))            
        } else if (navDevId > 0) {
            appLog("NavDev Mac " + navData.navDevMac + " has id " + navDevId)
        }
        
        //3. From whole list, filter to the known ones
        let validBeacons = []
        navData.measuredBeacons.forEach(measuredBeacon => {
            if (this.beacons.has(measuredBeacon.mac)) {
                let storedBeacon = this.beacons.get(measuredBeacon.mac)
                //Besides setting the TX of the beacon, it calculates NAvDev the distance to it
                measuredBeacon.setTx(storedBeacon.tx)
                //Set known beacon position
                measuredBeacon.setPoint(storedBeacon.point)
                appLog("Beacon Mac " + measuredBeacon.mac + " is known, distance " + measuredBeacon.distance)
                validBeacons.push(measuredBeacon)
            } else {
                appLog("Beacon Mac " + measuredBeacon.mac + " is NOT known")
            }
        });

        //3. Process RSSI from sent list and get position
        let pointResolver = new PointResolver(validBeacons)
        let trilatPoint = pointResolver.getPosition()
        appLog("navdev " + navData.navDevMac + " position is " + trilatPoint.toString())
        
        //4. Store position for navId
        if (trilatPoint.isValid()) {
            let time = new Date(pointResolver.timestamp)
            time = time > new Date("01/01/2021") ? time : new Date()           
            this.storePosition(navData.navDevMac, trilatPoint, time)
        } else {
            appLog("navdev calculated position is not valid, not storing")
        }     
    }
}

export { RssiController } 