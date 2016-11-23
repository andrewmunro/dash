let DashDetector = require('./DashDetector');

let detector = new DashDetector();

detector.on('press', (mac) => console.log(mac));
