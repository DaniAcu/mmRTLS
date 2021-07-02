class MeasuredBeacon {
    constructor(mac, channel, rssi, timestamp) {
        this.rx = NaN
        this.mac = mac
        this.channel = channel
        if (!isNaN(rssi)) this.setRssi(rssi)
        this.timestamp = timestamp                
        this.tx = NaN
        this.distance = 0
        this.point = null
    }

    setRssi(value) {
        this.rssi = value
        this.setRx(Math.pow(10, this.rssi/10)/1000)
    }

    setRx(value) {
        this.rx = value
        this.setDistance()
    }

    setTssi(value) {
        this.tssi = value
        this.setTx(Math.pow(10, this.tssi/10)/1000)
    }

    setTx(value) {
        this.tx = value
        this.setDistance()
    }

    setPoint(point) {
        this.point = point
    }

    setDistance() {
        if (!isNaN(this.tx) && !isNaN(this.rx)) {
            this.distance = this.rssiToMeters()
        }
    }

    rssiToMeters() {
        const c = 3e8
        const f = 2.4e9
        const k = c/f

        let d = (Math.sqrt(this.tx/this.rx) * k ) / (4 * Math.PI)
        return d
    }
}

export { MeasuredBeacon }