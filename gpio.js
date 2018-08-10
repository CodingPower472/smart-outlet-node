
class GPIOManager {

    constructor() {
        this.pins = {};
    }
    
    addDevice(id, pin) {
        this.pins[id] = pin;
    }

    getDeviceState(id) {
        const pin = this.pins[id];
        // TODO: get gpio device state
        return true;
    }

    setDeviceState(id, requestedState) {
        const pin = this.pins[id];
        // TODO: set gpio device state
        if (requestedState) {
        } else {
        }
    }

}

module.exports.GPIOManager = GPIOManager;
