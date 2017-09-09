var settings = require('../settings.js');
var volume = 0;
var volumeStep = 0;


var mpg = require('mpg123');

function playAudio(fileName) {
    var player = new mpg.MpgPlayer();

    player.on("end", function() {
        player.play(fileName);
    });

    player.play(fileName);

    return player;
}

var naturePlayer = playAudio(settings.music.nature);
var cityPlayer = playAudio(settings.music.city);

module.exports.bind = function (serial) {
    setInterval(function () {
        serial.updateAudioLevel();
    }, 1000);

    setInterval(function () {
        volume += volumeStep;
        if (volume > 100) {
            volume = 100;
        }

        if (volume < 0) {
            volume = 0;
        }

        try {
            if(cityPlayer.track) {
                cityPlayer.volume(volume);
            }
        } catch(err) {
            console.log(err);
            cityPlayer = playAudio(settings.music.city);
        }

        try {
            if(naturePlayer.track) {
                naturePlayer.volume(100 - volume);
            }
        } catch(err) {
            console.log(err);
            naturePlayer = playAudio(settings.music.nature);
        }

    }, 10);
}

module.exports.event = function (value) {
    var max = settings.music.sensorInterval[1] - settings.music.sensorInterval[0];
    var percentage = (value - settings.music.sensorInterval[0]) / max;

    if (percentage > 1) {
        percentage = 1;
    }

    if (percentage < 0) {
        percentage = 0;
    }

    //console.log(volumeStep, volume);
    volumeStep = percentage - 0.3;
}