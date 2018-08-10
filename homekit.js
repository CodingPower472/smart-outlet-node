
const fs = require('fs');
const path = require('path');
const randomMac = require('random-mac');
const homekit = require('hap-nodejs');
const Accessory = homekit.Accessory;
const Service = homekit.Service;
const Characteristic = homekit.Characteristic;
const uuidGen = homekit.uuid;

homekit.init();

class HomeKitManager {

    constructor() {
        this.outlets = {};
    }

    getUsernamePincode(id) {
        const filename = `${id}.accessory.state`;
        const username, pincode;
        try {
            const str = fs.readFileSync(path.join(__dirname, 'accessories', filename), 'utf-8');
            const json = JSON.parse(str);
            username = json.username;
            pincode = json.pincode;
        } catch (err) {
            
        }
    }

    updateValue(id, requestedValue) {
        const outlet = this.outlets[id];
        console.log('Updating homekit value to: ' + requestedValue);
        outlet
            .getService(Service.Outlet)
            .getCharacteristic(Characteristic.On)
            .updateValue(requestedValue);
    }

    addOutlet(id, outlet, onRequestChange, getState) {
        const uuid = uuidGen.generate(`hap-nodejs:accessories:${id}`);
        const accessory = new Accessory(outlet.name, uuid);
        accessory
            .getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, "Luke Bousfield")
            .setCharacteristic(Characteristic.Model, "SmartOutlet")
            .setCharacteristic(Characteristic.SerialNumber, "1VO5AD6BO2ZD");
        
        accessory.on('identify', (paired, callback) => {
            console.log('Identifying');
            callback();
        });

        accessory
            .addService(Service.Outlet, "Power Outlet")
            .getCharacteristic(Characteristic.On)
            .updateValue(true)
            .on('set', (value, callback) => {
                console.log('Setting homekit to: ' + value);
                onRequestChange(value);
                callback();
            })
            .on('get', (callback) => {
                callback(null, true);
            });

        accessory.publish({
            port: 51826,
            username: "D5:9D:3F:81:C7:9C",
            pincode: "020-82-911"
        });

        this.outlets[id] = accessory;
    }

}

module.exports.HomeKitManager = HomeKitManager
