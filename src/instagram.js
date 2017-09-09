var settings = require('../settings.js');

var count = {};

var request = require('request');

function getCounter(hashTag, callback) {
  //console.log('https://www.instagram.com/explore/tags/' + hashTag + '/');
  request('https://www.instagram.com/explore/tags/' + hashTag + '/', function (error, response, body) {
    //console.log('error:', error); // Print the error if one occurred
    //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body); // Print the response status code if a response was received

    if (error || response.statusCode != 200) {
      callback(error || response.statusCode);
      return;
    }

    var data = body.split("window._sharedData = ");
    if (data.length != 2) {
      return callback("can not parse instagram page.");
    }

    data = data[1];
    data = data.split(";</script>");

    if (data.length < 2) {
      return callback("can not parse instagram page.");
    }

    try {
      data = data[0];
      data = JSON.parse(data);
      var lastPhoto = null;

      try {
        lastPhoto = data.entry_data.TagPage[0].tag.media.nodes[0].display_src;
      } catch(e) {}

      callback(null, data.entry_data.TagPage[0].tag.media.count, lastPhoto);
    } catch(err) {
      callback(err);
    }
  });
}

function beginListen(serial, bot, hashTag) {
  setTimeout(function () {
    getCounter(hashTag, function (err, countPhotos, lastPhoto) {
      beginListen(serial, bot, hashTag);

      if(err) {
        bot.beginDialog({ channel: settings.slackChannel }, '/notify', JSON.stringify(err));
        return;
      }

      if (countPhotos <= count[hashTag]) {
        return;
      }

      serial.allHappy();
      var diff = countPhotos - count[hashTag];
      var cnt = "";

      if (diff == 1) {
        cnt = "este *o poza noua*";
      } else if (diff > 1) {
        cnt = "sunt *" + diff + " poze noi*";
      }

      var message = "pe instagram " + cnt + " cu #" + hashTag + "\n";
      message += lastPhoto + "\n";
      message += "https://www.instagram.com/explore/tags/" + hashTag + "\n";

      count[hashTag] = countPhotos;
      bot.beginDialog({ channel: settings.slackChannel }, '/notify', message);
    });
  }, 3000);
}

function init(serial, bot) {
  settings.hashTag.forEach((hashTag) => {
    getCounter(hashTag, function (err, countPhotos) {
      if(err) {
        bot.beginDialog({ channel: settings.slackChannel }, '/notify', "Nu merge instagram! " + JSON.stringify(err));
        return;
      }

      count[hashTag] = countPhotos;
      beginListen(serial, bot, hashTag);
    });
  });
}

module.exports.init = init;
