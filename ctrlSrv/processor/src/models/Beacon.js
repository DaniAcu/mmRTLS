class Beacon { 
    constructor(mac, name, point, tssi, channel) {
        this.mac = mac
        this.name = name
        this.point = point
        this.tssi = tssi
        this.channel = channel
        this.tx = Math.pow(10, this.tssi/10)/1000
    }
}

export { Beacon }