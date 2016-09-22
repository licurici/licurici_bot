var Twitter = require('twitter');
var settings = require('../settings.js');

var client = new Twitter(settings.twitter);

var max_id = "";

var fd = fs.openSync("twitter_max_id.txt");

if(fd) {
  fs.readSync(fd, max_id);
  fs.closeSync(fd);
  max_id = parseInt(max_id) || 0;
}


function beginListen(serial, bot) {
  setTimeout(function() {
    client.get('search/tweets', {q: settings.hashTag}, function(error, tweets, response) {
      if(tweets.search_metadata && tweets.search_metadata.max_id != max_id) {

        var messages = [];
        var message;

        for(var i=0; i<tweets.statuses.length; i++) {
          if(tweets.statuses[i].id > max_id) {
            messages.push(":left_speech_bubble: " + tweets.statuses[i].text);
          }
        }

        if(messages.length === 1) {
          message = "avem *un tweet* nou cu `#" + settings.hashTag + "`\n";
        } else if (messages.length > 1) {
          message = "avem *" + messages.length + " tweeturi* noi cu `#" + settings.hashTag + "`\n";
        }

        if (messages.length >= 1) {
          serial.allHappy();

          message += messages.join('\n\n');

          bot.beginDialog({channel: settings.slackChannel}, '/notify', message);
        }

        max_id = tweets.search_metadata.max_id;
        fs.writeFileSync("twitter_max_id.txt", max_id);
      }

      beginListen(serial, bot);
    });
  }, 10000);
}

function init(serial, bot) {
  client.get('search/tweets', {q: settings.hashTag}, function(error, tweets, response) {
    max_id = tweets.search_metadata.max_id;
    var last = tweets.statuses[0];
    var message;

    if(last) {
      var date = new Date(last.created_at);
      message = "*ultimul tweet* cu `#" + settings.hashTag + "` a fost la ora " + date.toLocaleTimeString() + "\n";
      message += ":left_speech_bubble: " + last.text;
    } else {
      message = "*inca nu* avem tweeturi cu `#" + settings.hashTag + "`";
    }

    bot.beginDialog({channel: settings.slackChannel}, '/notify', message);

    beginListen(serial, bot);
  });
}


module.exports.init = init;
