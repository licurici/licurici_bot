var settings = require('../settings.js');
var instagramWrapi = require('@wrapi/instagram');

var client = new instagramWrapi(settings.instagram);
var count = 0;


function init(serial, bot) {
  client.tags.get(settings.hashTag, function(err, data) {
    if (!err) {
      var message = "pe instagram sunt " + data.data.media_count + " poze cu #" + settings.hashTag + "\n";
      message += "https://www.instagram.com/explore/tags/" + settings.hashTag + "\n";

      count = data.data.media_count;
      bot.beginDialog({channel: settings.slackChannel}, '/notify', message);
    }
  });

  setInterval(function() {
    client.tags.get(settings.hashTag, function(err, data) {
      if (!err) {
        if(count < data.data.media_count) {
          var diff = data.data.media_count - count;
          var cnt = "";

          if(diff == 1) {
            cnt = "este o poza noua";
          } else if(diff > 1) {
            cnt = "sunt " + diff + " poze noi";
          }

          var message = "pe instagram " + cnt + " cu #" + settings.hashTag + "\n";
          message += "https://www.instagram.com/explore/tags/" + settings.hashTag + "\n";

          count = data.data.media_count;
          bot.beginDialog({channel: settings.slackChannel}, '/notify', message);
        }
      }
    });
  }, 10000);
}

module.exports.init = init;
