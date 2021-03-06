var settings = require('../settings.js');
var triggerEvent;
var serial;

module.exports.bind = function (serialCommunication, event) {
    triggerEvent = event;
    serial = serialCommunication;

    setInterval(function () {
        serial.readDistance();
    }, 300);
}

var latest3DistanceReadings = {};


module.exports.event = function(index, value) {
    value = parseInt(value);

    if(!latest3DistanceReadings[index]) {
        latest3DistanceReadings[index] = [];
    }

    if(latest3DistanceReadings[index].length < 3)
    {
        latest3DistanceReadings[index].push(value);
        return;
    }

    if(latest3DistanceReadings[index].length == 3)
    {
        latest3DistanceReadings[index].shift();
        latest3DistanceReadings[index].push(value);

        var isDecreasing = latest3DistanceReadings[index][0] > latest3DistanceReadings[index][1] && latest3DistanceReadings[index][1] > latest3DistanceReadings[index][2];

        if(isDecreasing)
        {
            console.log("se apropie");
            serial.hilightFlicker();

            if(triggerEvent) {
                triggerEvent();
            }
        }
    }

    //console.log(latest3DistanceReadings);
}