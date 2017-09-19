var fs = require('fs');
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

var naturePlayer;
var cityPlayer;
var cricketPlayer;

var cricketVolume = 100;
var cricketTarget = 100;
var cricketTimeout;

module.exports.bind = function (serial) {
    if (!fs.existsSync(settings.music.nature) ||
        !fs.existsSync(settings.music.city) ||
        !fs.existsSync(settings.music.cricket)) {
        console.error("The audio files are not available. Skip the sount part.");
        return;
    }

    naturePlayer = playAudio(settings.music.nature);
    cityPlayer = playAudio(settings.music.city);
    cricketPlayer = playAudio(settings.music.cricket);

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

        try {
            if(cricketPlayer.track) {
                cricketPlayer.volume(Math.max(0, cricketVolume - volume));
            }
        } catch(err) {
            console.log(err);
            cricketPlayer = playAudio(settings.music.cricket);
        }

    }, 10);

    setInterval(function() {
        if(cricketTarget == cricketVolume) {
            return;
        }

        if(cricketTarget > cricketVolume) {
            cricketVolume++;
        } else {
            cricketVolume--;
        }
    }, 20);
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

    volumeStep = percentage - 0.3;
}

module.exports.closeEvent = function () {
    clearTimeout(cricketTimeout);

    cricketTimeout = setTimeout(function() {
        cricketTarget = 100;
    }, 5000);

    cricketTarget = 0;
}