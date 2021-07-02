import { MeasuredBeacon } from './measuredBeacon.js'
import { Point } from '../models/point.js'
import { appLog } from '../helpers/logger.js'

class PointResolver {
    constructor(measuredBeacons) {
        this.beacons = measuredBeacons
        this.position = null 
        this.timestamp = 0
    }

    getPosition() {
        if (!this.position) {
           this.position = this.distancesToPositions()
        }

        return this.position
    }

    distancesToPositions() {
        let N = this.beacons.length
        let validPositions = 0
        let position = new Point(0, 0)
        appLog("Processing distancesToPositions for " + N + " measured beacons")
        this.timestamp = 0

        for (let i = 0; i < N; i++) {
            for (let j= 0; j < N; j++) {
                if ( j == i ) continue

                for (let k= 0; k < N; k++) {
                    if (k == j || k == i) continue
                    let p = this.trilat(this.beacons[i], this.beacons[j],this.beacons[k]);
                    if (p) {
                        position = position.add(p)
                        //appLog("intermediate pos  " + p)
                        this.timestamp += (this.beacons[i].timestamp + this.beacons[j].timestamp + this.beacons[k].timestamp) / 3
                        validPositions++
                    } else {
                        appLog("Invalid trilat on current measured Beacons")
                    }
                }
            }
        }

        position = position.divScalar(validPositions)
        this.timestamp /= validPositions
        appLog("Made " + validPositions + " valid trilaterations")

        return position
    }

    trilat(beaconA, beaconB, beaconC) {
        let pointA = beaconA.point
        let pointB = beaconB.point
        let pointC = beaconC.point
        if (pointA == null && pointB == null && pointC == null) {
            appLog("Invalid beacon points")
            return null
        }

        let D = pointA.distance(pointB);

        // We have two triangles that share a side, 
        // Da and Db are both a hypotenuse,
        // h is the shared side
        // D is the lineal sum of both coaxial sides.
        //          P
        //         /|\
        //        / | \
        //     Da/  |h \Db
        //      /   |   \
        //     / d1 | d2 \
        //    *-----------*
        //    A           B => D = BA
        
        let d1 = (D*D + beaconA.distance*beaconA.distance - beaconB.distance*beaconB.distance) / (2*D);
        let h = Math.sqrt( beaconA.distance*beaconA.distance - d1*d1 );
        if (isNaN(h)) {
            appLog("Trilat: Invalid Math for sqrt of distance")
            return null
        }
        
        // With points A and B, we can find the Position P, but we the fact is that there are
        // two posible solutions, we build a rhombus with both posible P:
        
        //Using the versor between points A and B, we know one direction
        let Dver = pointB.substract(pointA).toVersor();
        // we need to rotate that direction by alpha and -alpha
        let alpha = Math.tan(h/d1);

        let upper = Dver;
        let downer = Dver;
        upper.rotateBy(alpha);
        downer.rotateBy(-alpha);
        upper = upper.multScalar(beaconA.distance);
        downer = downer.multScalar(beaconA.distance);
        
        // Now we have two vectors with |Da| that point from A where the two posible positions are
        let P1 = pointA.add(upper);
        let P2 = pointA.add(downer);

        //Now we need to see which P1 or P2 is at distance Dc from pointC.
        //But since all numbers we got (Da,Db and Dc) cointain a lot of error and noise
        // we know that they won't be the same number so we need to pick the point that makes the distance to pointC the closest to Dc

        let C_P1 = P1.distance(pointC);
        let C_P2 = P2.distance(pointC);

        let error1 = Math.abs( C_P1 - beaconC.distance );
        let error2 = Math.abs( C_P2 - beaconC.distance );

        if ( error1 < error2 ) {
            return P1;
        } else {
            return P2;
        }            
    }
}

export { PointResolver }