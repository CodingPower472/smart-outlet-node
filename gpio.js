
const rpio = require('rpio');

class GPIOManager {

    constructor() {
        this.outlets = {};
    }
    
    addDevice(id, pin, reverse) {
        this.outlets[id] = {
            pin: pin,
            reverse: reverse
        };
        rpio.open(pin, rpio.OUTPUT);
        console.log(`Opened pin ${pin}`);
    }

    getDeviceState(id) {
        const pin = this.outlets[id].pin;
        console.log(rpio.read(pin));
        return rpio.read(pin);
    }

    setDeviceState(id, requestedState) {
        const pin = this.outlets[id].pin;
        const reverse = this.outlets[id].reverse;
        if (requestedState != reverse) {
            rpio.write(pin, rpio.HIGH);
        } else {
            rpio.write(pin, rpio.LOW);
        }
    }

}

module.exports.GPIOManager = GPIOManager;
