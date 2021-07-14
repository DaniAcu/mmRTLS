import { appLog } from '../helpers/logger.js'
import { DbController } from '../controllers/dbController.js'
import { Beacon } from '../models/beacon.js'
import { Point } from '../models/point.js'

const beaconTable = "Beacon"
class BeaconController {
    
    constructor(dbController) {
        this.dbController = dbController
        this.beacons = []     
    }

    async getBeacons(forceUpdate, maxBeacons) {
        if (forceUpdate == null) {
            forceUpdate = false
        }

        if (this.beacons.length > 0 && !forceUpdate) {
            return this.beacons
        }

        if (maxBeacons == null) {
            maxBeacons = 100
        }

        appLog("Getting beacons info from database")
        try {
            let result = await this.dbController.queryPromise("SELECT * FROM beacon LIMIT ?", [maxBeacons])
            
            if (result[0] === undefined) {
                return []
            } else {
                this.beacons = []
                result.forEach(element => {
                    this.beacons.push(new Beacon(element.mac, element.name, new Point(element.x, element.y), element.tssi, element.channel))
                });
                return this.beacons
            }
        } catch (error) {
            appLog("MySQL query failed " + error)
            return []
        }
    }
}

export { BeaconController } 