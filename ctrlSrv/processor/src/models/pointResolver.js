import { MeasuredBeacon } from './measuredBeacon.js'
import { Point } from '../models/point.js'
import { appLog } from '../helpers/logger.js'

class PointWError {
    constructor(point, error) {
        this.point = point
        this.error = error
    }  
}

class PointResolver {
    constructor(measuredBeacons) {
        this.beacons = measuredBeacons
        this.position = null 
        this.range = 0
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
        appLog("Processing distancesToPositions for " + N + " measured beacons")
        let position = new Array;
        let error = new Array;
        let timestamp = new Array;

        for (let i = 0; i < N; i++) {
            for (let j= 0; j < N; j++) {
                if ( j == i ) continue

                for (let k= 0; k < N; k++) {
                    if (k == j || k == i) continue
                    let pointWError = this.trilat(this.beacons[i], this.beacons[j],this.beacons[k]);
                    if (pointWError) {
                        position.push(pointWError.point);
                        error.push(pointWError.error);
                        timestamp.push( (this.beacons[i].timestamp + this.beacons[j].timestamp + this.beacons[k].timestamp) / 3 )
                    } else {
                        appLog("Invalid trilat on current measured Beacons")
                    }
                }
            }
        }
        appLog("Made " + position.length + " valid trilaterations")
        // Average of all time stamps.
        this.timestamp = 0;
        timestamp.forEach( t => {
            this.timestamp += t;
        })
        this.timestamp /= timestamp.length;
        
        // Position Average: inverse weighted average
        this.position = new Point(0.0, 0.0); 
        let divisor = 0.0;
        for( let i = 0 ; i < position.length; i++){
            this.position.y += position[i].y / error[i];
            this.position.x += position[i].x / error[i];
            divisor += 1.0 / error[i];
        }

        this.position.x /= divisor;
        this.position.y /= divisor;
        
        // X & Y Standar Deviation
        let sd_x = 0.0;
        let sd_y = 0.0;
        for (let i = 0; i < position.length; i++) {
            sd_x += Math.pow(position[i].x - this.position.x, 2.0) / error[i] ;
            sd_y += Math.pow(position[i].y - this.position.y, 2.0) / error[i];
        }
        sd_x /= (position.length - 1) * divisor;
        sd_y /= (position.length - 1) * divisor;
        sd_x = Math.sqrt(sd_x);
        sd_y = Math.sqrt(sd_y); 

        appLog("sd_x: " + sd_x);
        appLog("sd_y: " + sd_y);

        this.range = Math.sqrt( sd_x*sd_x + sd_y*sd_y );



        return this.position
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
            return new PointWError(P1, error1 / beaconC.distance);
        } else {
            return new PointWError(P2, error2 / beaconC.distance);
        }            
    }
}

export { PointResolver }