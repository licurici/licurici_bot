var settings = require('../settings.js');
var volume = 0;
var volumeStep = 0;


module.exports.bind = function(serial) {
    setInterval(function() {
        serial.updateAudioLevel();
    }, 1000);

    setInterval(function() {
        volume += volumeStep;
        if(volume > 100) {
            volume = 100;
        }

        if(volume < 0) {
            volume = 0;
        }
    }, 50);
}

module.exports.event = function(value) {
    var max = settings.music.sensorInterval[1] - settings.music.sensorInterval[0];
    var percentage = (value - settings.music.sensorInterval[0]) / max;
    if(percentage > 1) {
        percentage = 1;
    }

    if(percentage < 0) {
        percentage = 0;
    }

    console.log(volumeStep, volume);

    volumeStep = 10 * (percentage - 0.5);
}