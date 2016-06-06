
var events = {};
var lastTime = new Date();
var timeout = null;
var slackBot = null;
var channel = "";

module.exports.setBot = function(bot) {
  slackBot = bot;
};

module.exports.setChannel = function(ch) {
  channel = ch;
};


module.exports.send = function(key, event) {
  clearTimeout(timeout);

  events[key] = event;

  var diff = new Date() - lastTime;

  timeout = setTimeout(function () {
    var message = "";

    for(key in events) {
      message += "`" + events[key] + "` ";
    }

    if(message !== "") {
      slackBot.beginDialog({channel: channel}, '/notify', message);
    }

    events = {};
  }, 1000);
};
