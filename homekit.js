
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
        var username = "broken", pincode = "broken";
        if (!fs.existsSync(path.join(__dirname, 'accessories'))) {
            console.log('/accessories doesn\'t exist, creating it');
            fs.mkdirSync(path.join(__dirname, 'accessories'));
        }
        try {
            const str = fs.readFileSync(path.join(__dirname, 'accessories', filename), 'utf-8');
            const json = JSON.parse(str);
            username = json.username;
            pincode = json.pincode;
            console.log(`Accessory file already exists, username: ${username} and pincode ${pincode}`);
        } catch (err) {
            username = randomMac();
            const first3 = Math.floor(Math.random() * 1000);
            const middle2 = Math.floor(Math.random() * 100);
            const final3 = Math.floor(Math.random() * 1000);
            if (first3 < 100) {
                first3 = '0' + first3;
            }
            if (first3 < 10) {
                first3 = '0' + first3;
            }
            if (middle2 < 10) {
                middle2 = '0' + middle2;
            }
            if (final3 < 100) {
                final3 = '0' + final3;
            }
            if (final3 < 10) {
                final3 = '0' + final3;
            }
            pincode = `${first3}-${middle2}-${final3}`;
            console.log(`Accessory file doesn't exist, generated username ${username} and pincode ${pincode}`);
            fs.writeFileSync(path.join(__dirname, 'accessories', filename), JSON.stringify({
                username: username,
                pincode: pincode
            }));
        }
        return {
            username: username,
            pincode: pincode
        };
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

        const usernamePincode = this.getUsernamePincode(id);

        console.log(usernamePincode);

        accessory.publish({
            port: 51826 + this.outlets.length,
            username: usernamePincode.username,
            pincode: usernamePincode.pincode
        });

        this.outlets[id] = accessory;
    }

}

module.exports.HomeKitManager = HomeKitManager
