class Point{
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    isValid() {
        return !isNaN(this.x) && !isNaN(this.y)
    }
    
    toString() {
        return "(x: " + this.x + ", y: " + this.y + ")"
    }
    
    substract(other) {
        return new Point(this.x - other.x, this.y - other.y)
    }

    add(other) {
        return new Point(this.x + other.x, this.y + other.y)
    }

    multScalar(k) {
        return new Point(this.x * k, this.y *k)
    }

    divScalar(k) {
        return new Point(this.x / k, this.y /k)
    }
    
    distance(other) {
        let delta = this.substract(other)
        return delta.mod()
    }

    mod() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    phase() {
        return Math.atan2(this.y, this.x)
    }

    toVersor() {
        let m = this.mod()
        return this.divScalar(m)
    }

    rotateBy(alpha) {
        let m = this.mod()
        let rho = this.phase() + alpha
        this.x = m * Math.cos(rho)
        this.y = m * Math.sin(rho)
    }
}

export { Point }