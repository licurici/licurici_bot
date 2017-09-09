var Twitter = require('twitter');
var settings = require('../settings.js');
const fs = require('fs');

var client = new Twitter(settings.twitter);

var max_id = "";

function beginListen(serial, bot) {
  setTimeout(function() {
    client.get('search/tweets', {q: settings.hashTag.join(" OR ")}, function(error, tweets, response) {
      if(tweets && tweets.search_metadata && tweets.search_metadata.max_id != max_id) {
        var messages = [];
        var message;

        for(var i=0; i<tweets.statuses.length; i++) {
          if(tweets.statuses[i].id > max_id) {
            messages.push(":left_speech_bubble: " + tweets.statuses[i].text);
          }
        }

        if(messages.length === 1) {
          message = "avem *un tweet* nou cu `#" + settings.hashTag.join(" OR #") + "`\n";
        } else if (messages.length > 1) {
          message = "avem *" + messages.length + " tweeturi* noi cu `#" + settings.hashTag.join(" OR #") + "`\n";
        }

        if (messages.length >= 1) {
          serial.allHappy();

          message += messages.join('\n\n');

          bot.beginDialog({channel: settings.slackChannel}, '/notify', message);
        }

        max_id = tweets.search_metadata.max_id;
      }

      beginListen(serial, bot);
    });
  }, 10000);
}

function init(serial, bot) {
  client.get('search/tweets', {q: settings.hashTag.join(" OR ")}, function(error, tweets, response) {
    max_id = tweets.search_metadata.max_id;
    beginListen(serial, bot);
  });
}


module.exports.init = init;
