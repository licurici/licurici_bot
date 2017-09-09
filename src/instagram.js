var settings = require('../settings.js');
var instagramWrapi = require('@wrapi/instagram');

var client = new instagramWrapi(settings.instagram);
var count = 0;

function beginListen(serial, bot) {
  setTimeout(function () {
    settings.hashTag.forEach((hashTag) => {
      client.tags.get(hashTag, function (err, data) {
        beginListen(serial, bot);

        if (!err && data && data.data) {
          if (count < data.data.media_count) {
            serial.allHappy();

            var diff = data.data.media_count - count;
            var cnt = "";

            if (diff == 1) {
              cnt = "este *o poza noua*";
            } else if (diff > 1) {
              cnt = "sunt *" + diff + " poze noi*";
            }

            var message = "pe instagram " + cnt + " cu #" + hashTag + "\n";
            message += "https://www.instagram.com/explore/tags/" + hashTag + "\n";

            count = data.data.media_count;
            bot.beginDialog({ channel: settings.slackChannel }, '/notify', message);
          }
        } else if (err) {
          bot.beginDialog({ channel: settings.slackChannel }, '/notify', err);
        } else {
          bot.beginDialog({ channel: settings.slackChannel }, '/notify', JSON.stringify(data));
        }
      });
    });
  }, ((3600 / 500) / settings.hashTag.length) * 1000);
}

function init(serial, bot) {
  settings.hashTag.forEach((hashTag) => {
    client.tags.get(hashTag, function (err, data) {
      if (!err && data.data) {
        count = data.data.media_count;
        beginListen(serial, bot);
      } else {
        bot.beginDialog({ channel: settings.slackChannel }, '/notify', "Nu merge instagram! " + JSON.stringify(data));
      }
    });
  });
}

module.exports.init = init;
