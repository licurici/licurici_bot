var settings = require('../settings.js');

module.exports.bind = function (serial) {

    setInterval(function () {
        serial.readDistance();
    }, 1000);

}

var latest3DistanceReadings = [];


module.exports.event = function (value) {
    if (value > parseInt(settings.distance.distanceThreshold))
    {
        if(latest3DistanceReadings.length < 3)
        {
            latest3DistanceReadings.push(value);
        }
        else if(latest3DistanceReadings.length == 3)
        {
            latest3DistanceReadings.shift();
            latest3DistanceReadings.push(value);

            if(parseInt(latest3DistanceReadings[0]) >  parseInt(latest3DistanceReadings[1]) && parseInt(latest3DistanceReadings[1]) > parseInt(latest3DistanceReadings[2]))
            {
                console.log("se apropie");
            }
        }
        console.log(latest3DistanceReadings);

        
    }
    else
        console.log("prea aproape");
}