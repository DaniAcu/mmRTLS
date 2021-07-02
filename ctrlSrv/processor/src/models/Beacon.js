class Beacon { 
    constructor(mac, name, point, tssi) {
        this.mac = mac
        this.name = name
        this.point = point
        this.tssi = tssi
        this.tx = Math.pow(10, this.tssi/10)/1000
    }
}

export { Beacon }