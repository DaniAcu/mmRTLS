import { appLog }         from '../src/helpers/logger.js'
import { MeasuredBeacon } from '../src/models/measuredBeacon.js'
import { Point } from '../src/models/point.js'
import { PointResolver } from '../src/models/pointResolver.js'


function getRx(tx, distance) {
    const c = 3e8;
    const f = 2.4e9;
    return tx * (Math.pow(c/f, 2) / Math.pow(4* Math.PI*distance, 2))
}

function getdBm(tx) {
    return 10 * Math.log10(tx) + 30
}

function testDistance() {
    appLog("Test tssi/rssi to distance")
    let beacon = new MeasuredBeacon()
    beacon.setRssi(-20)
    beacon.setTssi(-20)
    appLog("case 1: tx " + beacon.tx* 1000 + "mW, rx " + beacon.rx*1000 + "mW")
    appLog("case 1: Calculated distance " + beacon.distance)
    let rx = getRx(beacon.tx, beacon.distance, 2)
    appLog("case 1: recovered distance to rx " + rx*1000 + " mW")

    beacon.setRssi(-30)
    appLog("case 2: tx " + beacon.tx* 1000 + "mW, rx " + beacon.rx*1000 + "mW")
    appLog("case 2: ReCalculated distance " + beacon.distance)
    rx = getRx(beacon.tx, beacon.distance, 2)
    appLog("case 2: recovered distance to rx " + rx*1000 + " mW")

    beacon.setTssi(-10)
    appLog("case 3: tx " + beacon.tx* 1000 + "mW, rx " + beacon.rx*1000 + "mW")
    appLog("case 3: ReCalculated distance " + beacon.distance)
    rx = getRx(beacon.tx, beacon.distance, 2)
    appLog("case 3: recovered distance to rx " + rx*1000 + " mW")
}

function testTrilaterationWithDistances() {
    appLog("Test trilateration")
    appLog("\n           B2(5,7)\n" +
        "           /|\\\n" +
        "          / | \\\n" +
        "         /  *N \\\n" +
        "        /   |   \\\n" +
        "       /    |    \\\n" +
        "(0,0)B1-----------B3(9,0)\n")
    appLog("D1: 5.5   D2: 3.2   D3:5.5\n")    
    let validBeacons = []

    let beacon1 = new MeasuredBeacon()
    beacon1.distance = 5.5
    beacon1.point = new Point(0,0)
    validBeacons.push(beacon1)

    let beacon2 = new MeasuredBeacon()
    beacon2.distance = 3.2
    beacon2.point = new Point(5,7)
    validBeacons.push(beacon2)

    let beacon3 = new MeasuredBeacon()
    beacon3.distance = 5.5
    beacon3.point = new Point(9,0)
    validBeacons.push(beacon3)
    appLog("rssi's: " + getdBm(getRx(.1, beacon1.distance)) +
           ", " + getdBm(getRx(.1, beacon2.distance))     +
           ", " + getdBm(getRx(.1, beacon3.distance))
    )

    appLog("Beacon data " + JSON.stringify(validBeacons))

    let pointResolver = new PointResolver(validBeacons)
    let trilatPoint = pointResolver.getPosition()
    appLog("Calculated position is " + trilatPoint.toString())
    appLog("Calculated expected (4.7, 3.2)")
}

function testTrilaterationWithRSSI() {
    appLog("Test trilateration, all tssi 20dBM")
    appLog("\n           B2(5,7)\n" +
        "           /|\\\n" +
        "          / | \\\n" +
        "         /  *N \\\n" +
        "        /   |   \\\n" +
        "       /    |    \\\n" +
        "(0,0)B1-----------B3(9,0)\n")
    appLog("RSSI1: -34.85325   RSSI2: -30.14899   RSSI33:-34.85325\n")    
    let validBeacons = []

    let beacon1 = new MeasuredBeacon()
    beacon1.setTssi(20)
    beacon1.setRssi(-34.853250810165676)
    beacon1.point = new Point(0,0)
    validBeacons.push(beacon1)

    let beacon2 = new MeasuredBeacon()
    beacon2.setTssi(20)
    beacon2.setRssi(-30.14899658667892)
    beacon2.point = new Point(5,7)
    validBeacons.push(beacon2)

    let beacon3 = new MeasuredBeacon()
    beacon3.setTssi(20)
    beacon3.setRssi(-34.853250810165676)
    beacon3.point = new Point(9,0)
    validBeacons.push(beacon3)
    appLog("rssi's: " + getdBm(getRx(.1, beacon1.distance)) +
           ", " + getdBm(getRx(.1, beacon2.distance))     +
           ", " + getdBm(getRx(.1, beacon3.distance))
    )

    appLog("Beacon data " + JSON.stringify(validBeacons))

    let pointResolver = new PointResolver(validBeacons)
    let trilatPoint = pointResolver.getPosition()
    appLog("Calculated position is " + trilatPoint.toString())
    appLog("Calculated expected (4.7, 3.2)")
}


function main() {
    //TODO: Use Jest to test
    testDistance()
    testTrilaterationWithDistances()
    testTrilaterationWithRSSI()
}

//Start the main app
main()