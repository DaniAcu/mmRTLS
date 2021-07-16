#![allow(dead_code)]
// extern crate conv;
// use conv::ValueFrom;

use crate::point::Point;

#[derive(Debug, Clone, Copy)]
struct Beacon{
    pos: Point,
    distance: f32,
}

#[derive(Debug, Clone)]
struct PositionSolver{
    beacons: Vec<Beacon>,
    timestamp: i32,
    position: Option<Point>,
    range: Option<f32>,
}

impl PositionSolver{
    pub fn new( mb: Vec<Beacon> ) -> Self {
        PositionSolver{
            beacons: mb,
            timestamp: 0,
            position: None,
            range: None,
        }
    }
    pub fn get_position( self: &mut Self) -> Option<Point> {
        if self.position == None {
            self.distances_to_positions();
        }
        self.position.clone()
    }
    pub fn get_range( self: Self) -> f32{
        if let Some(r) = self.range{
            r
        } else {
            0.0
        }
    }
    
    fn distances_to_positions( self: &mut Self){
        let M = self.beacons.len();
        let mut pos_vec = Vec::<(Point, f32)>::new();
        
        if M < 3 {
            println!("Got less than 3 beacons, can't run trilateration algorithm");
            return;
        }
        println!("Processing distances_to_positions for {} measured beacons", M);
        for i in 0..M {
            for j in 0..M {
                if i == j {
                    continue;
                }
                for k in 0..M {
                    if i == k || j == k {
                        continue;
                    }
                    if let Some( tupple ) = trilat(self.beacons[i], self.beacons[j], self.beacons[k]) {
                        pos_vec.push( tupple );
                    } else {
                        println!("Invalid set of beacons");
                    }
                }
            }
        }

        let mut r = 0.0f32;
        let mut N = 0i16;
        let mut pos = Point::new(0.0, 0.0);
        for (p, error) in pos_vec {
            if  error < 0.15f32 {
                N += 1;
                pos.x += p.x;
                pos.y += p.y;
                r += error;
                println!("{:?} +/- {}", p, r);
            }
        } 
        let N = f32::from(N);
        self.position = Some( Point{ x: pos.x / N, y: pos.y / N} );
        self.range = Some(r);
    }

}

fn trilat(a: Beacon, b: Beacon, c: Beacon) -> Option<(Point,f32)>{
    
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
    //    A           B => D = |BA|
    
    let BA = b.pos - a.pos; 
    let D = BA.module();
    let d1 = (D*D + a.distance*a.distance - b.distance*b.distance) / (2.0*D);
    let h = f32::sqrt( a.distance*a.distance - d1*d1 );
    
    if h.is_nan() {
        println!("Trilat: Invalid Math for sqrt of distance");
        return None
    }

    // With points A and B, we can find the Position P, but we the fact is that there are
    // two posible solutions, we build a rhombus with both posible P:
    
    //Using the versor between points A and B, we know one direction
    let Dver = BA.to_versor();
    // we need to rotate that direction by alpha and -alpha
    let alpha = f32::tan(h/d1);

    let mut upper = Dver;
    let mut downer = Dver;
    upper.rotate_by(alpha);
    downer.rotate_by(-alpha);
    upper *= a.distance;
    downer *= a.distance;

    // Now we have two vectors with |Da| that point from A where the two posible positions are
    let P1 = a.pos + upper;
    let P2 = a.pos + downer;

    //Now we need to see which P1 or P2 is at distance Dc from pointC.
    //But since all numbers we got (Da,Db and Dc) cointain a lot of error and noise
    // we know that they won't be the same number so we need to pick the point that makes the distance to pointC the closest to Dc

    let c_p1 = (c.pos - P1).module();
    let c_p2 = (c.pos - P2).module();

    let error1 = f32::abs( c_p1 - c.distance );
    let error2 = f32::abs( c_p2 - c.distance );

    if error1 < error2 {
        return Some( (P1, error1/c.distance) );
    } else {
        return Some( (P2, error2/c.distance) );
    }            
}


#[test]
fn position_solver_test(){
    let A = Beacon{
        pos: Point{ x: 0.0, y: 0.0},
        distance: 4.6
    };
    let B = Beacon{
        pos: Point{ x: 4.0, y: 4.5},
        distance: 2.25
    };
    let C = Beacon{
        pos: Point{ x: 7.4, y: 1.5},
        distance: 3.5
    };

    let P = Point::new(4.1, 2.25);
    let mut ps = PositionSolver::new( vec![A,B,C] );

    if let Some(p) = ps.get_position() {
        let error = (P-p).module();

        println!("Original position: \n\t{:?}", P);
        println!("Calculated position: \n\t{:?} +/- {}", p, ps.get_range());
        println!("error = {}", error);
        assert!( error < 1.0 );
    } else {
        println!("Invalid position");
        assert!( false );
    }
}
