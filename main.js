const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const HomeKitManager = require('./homekit').HomeKitManager;
const GPIOManager = require('./gpio').GPIOManager;

const outletsInfo = require('./outlets');
const app = express();
const gpioMan = new GPIOManager();
const homekitMan = new HomeKitManager();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({
    extended: true
}));

var outlets = {};

for (id in outletsInfo) {
    const outletInfo = outletsInfo[id];
    gpioMan.addDevice(id, outletInfo.pin, outletInfo.reverse);
    const outlet = {
        name: outletInfo.name,
        state: gpioMan.getDeviceState(id)
    };
    outlets[id] = outlet;
    homekitMan.addOutlet(id, outlet, requestedState => {
        changeState(id, requestedState);
    }, () => getState(id));
}

console.log(outlets);

function changeState(id, requestedState) {
    console.log(`Changing state of outlet with id ${id} to ${requestedState}`);
    outlets[id].state = requestedState;
}

function getState(id) {
    console.log(`Getting state of outlet with id ${id}, current state ${outlets[id].state}`);
    return outlets[id].state;
}

app.get('/', (req, res) => {
    console.log('Getting home page');
    console.log('Fan state: ' + outlets.fan.state);
    res.render('index', {
        outlets: outlets
    })
});

app.post('/state/:outletId', (req, res) => {
    const outletId = req.params.outletId;
    const requestedState = req.body.state;
    console.log(req.body);
    console.log(`Setting ${outletId}'s state to ${requestedState}`)
    gpioMan.setDeviceState(outletId, requestedState);
    outlets[outletId].state = requestedState;
    homekitMan.updateValue(outletId, requestedState);
    res.redirect('/');
});

app.listen(80);
