let request = require('request');

let DashDetector = require('./DashDetector');

let detector = new DashDetector();

const IFTTT_KEY = '****';
const EVENT_NAME = 'dash_pressed'

detector.on('press', (mac) => {
    console.log('Received event from', mac);

    request.post({
        url: `https://maker.ifttt.com/trigger/${EVENT_NAME}/with/key/${IFTTT_KEY}`
    }, (error, response, body) => {
        if(error) {
            console.error('Error:', error);
        } else {
            console.log('Event', EVENT_NAME, 'triggered');
        }
    });
});

console.log('Listening...');
