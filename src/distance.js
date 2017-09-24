var settings = require('../settings.js');
var triggerEvent;

module.exports.bind = function (serial, event) {
    triggerEvent = event;

    setInterval(function () {
        serial.readDistance();
    }, 1000);
}

var latest3DistanceReadings = {};


module.exports.event = function (index, value) {
    value = parseInt(value);

    if(!latest3DistanceReadings[index]) {
        latest3DistanceReadings[index] = [];
    }

    if(latest3DistanceReadings.length < 3)
    {
        latest3DistanceReadings.push(value);
        return;
    }

    if(latest3DistanceReadings.length == 3)
    {
        latest3DistanceReadings.shift();
        latest3DistanceReadings.push(value);

        var isDecreasing = latest3DistanceReadings[0] > latest3DistanceReadings[1] && latest3DistanceReadings[1] > latest3DistanceReadings[2];

        if(isDecreasing)
        {
            console.log("se apropie");

            if(triggerEvent) {
                triggerEvent();
            }
        }
    }

    console.log(latest3DistanceReadings);
}