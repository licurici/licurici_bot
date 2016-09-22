var settings = require('../settings.js');
var instagramWrapi = require('@wrapi/instagram');

var client = new instagramWrapi(settings.instagram);
var count = 0;

function beginListen(serial, bot) {
  setTimeout(function() {
    client.tags.get(settings.hashTag, function(err, data) {
      beginListen(serial, bot);

      if (!err && data && data.data) {
        if(count < data.data.media_count) {
          serial.allHappy();

          var diff = data.data.media_count - count;
          var cnt = "";

          if(diff == 1) {
            cnt = "este *o poza noua*";
          } else if(diff > 1) {
            cnt = "sunt *" + diff + " poze noi*";
          }

          var message = "pe instagram " + cnt + " cu #" + settings.hashTag + "\n";
          message += "https://www.instagram.com/explore/tags/" + settings.hashTag + "\n";

          count = data.data.media_count;
          bot.beginDialog({channel: settings.slackChannel}, '/notify', message);
        }
      } else if(err) {
        bot.beginDialog({channel: settings.slackChannel}, '/notify', err);
      } else {
        bot.beginDialog({channel: settings.slackChannel}, '/notify', JSON.stringify(data));
      }
    });
  }, 10000);
}

function init(serial, bot) {
  client.tags.get(settings.hashTag, function(err, data) {
    if (!err && data.data) {
      count = data.data.media_count;
      beginListen(serial, bot);
    } else {
      bot.beginDialog({channel: settings.slackChannel}, '/notify', "Nu merge instagram!");
    }
  });
}

module.exports.init = init;
