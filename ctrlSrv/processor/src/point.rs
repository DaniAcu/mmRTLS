#![allow(dead_code)]

use std::{ops::{Add, AddAssign, Sub, SubAssign,Mul,MulAssign, Div, DivAssign}};


#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point{
    pub x: f32,
    pub y: f32,
}

impl Point{
    pub fn new(x: f32,y: f32) -> Point {
        Point{ x: x,
                y: y}
    }
    pub fn is_valid(self: &Self) -> bool{
        return (self.x != f32::NAN ) && (self.y != f32::NAN)
    }
    pub fn module( self: &Self ) -> f32{
        return f32::sqrt( self * self )
    }
    pub fn to_versor(self) -> Point {
        let mut v = self.clone();
        v /= self.module();
        v
    }
    pub fn phase(self: &Self) -> f32 {
        f32::atan2(self.y, self.x)
    }
    pub fn rotate_by(self: &mut Self, alpha: f32 ) {
        let m = self.module();
        let rho = self.phase() + alpha;
        self.x = m * f32::cos(rho);
        self.y = m * f32::sin(rho);
    }
}

impl Add for Point {
    type Output = Point;
    fn add(self, rhs: Self) -> Point{
        Point {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}

impl AddAssign for Point {
    fn add_assign(&mut self, rhs: Self) {
        self.x += rhs.x;
        self.y += rhs.y;
    }
}
impl Sub for &Point {
    type Output = Point;
    fn sub(self, rhs: &Point) -> Point {
        Point {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}
impl Sub for Point {
    type Output = Point;
    fn sub(self, rhs: Point) -> Point {
        Point {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}

impl SubAssign for Point {
    fn sub_assign(&mut self, rhs: Self) {
        self.x -= rhs.x;
        self.y -= rhs.y;
    }
}

impl Mul<f32> for &Point {
    type Output = Point;
    fn mul(self, k: f32 ) -> Point{
        Point {
            x: self.x * k,
            y: self.y * k,
        }
    }
}

impl Mul for &Point {
    type Output = f32;
    fn mul( self, rhs: Self ) -> f32 {
        self.x * rhs.x + self.y * rhs.y
    }
}
impl MulAssign<f32> for Point{
    fn mul_assign(&mut self, k: f32) {
        self.x *= k;
        self.y *= k;
    }
}

impl Div<f32> for Point{
    type Output = Point;
    fn div(self, k: f32) -> Self::Output {
        Point{
            x: self.x / k,
            y: self.y / k,
        }
    }
}

impl DivAssign<f32> for Point{
    fn div_assign(&mut self, k: f32) {
        self.x /= k;
        self.y /= k;
    }
}


#[test]
fn point_test(){
    let p = Point::new(1.0,1.0);
    let q = Point::new(1.0,1.0);
    let a = p+q;
    assert_eq!( a, Point::new(2.0,2.0));


    let mut a = Point::new(1.0,0.0);
    let b = Point::new(0.0, 1.0);
    let alpha = std::f32::consts::FRAC_PI_2;
    a.rotate_by( alpha );
    let d = (a - b).module();

    assert!( d < 0.00001 );
}
