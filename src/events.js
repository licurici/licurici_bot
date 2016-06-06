function events(bot, channel) {

  var events = {};

  this.send = function(key, event) {
    clearTimeout(this.timeout);

    events[key] = event;

    this.timeout = setTimeout(function() {
      var message = "";

      for(key in events) {
        message += "`" + events[key] + "` ";
      }

      if(message !== "") {
        bot.beginDialog({channel: channel}, '/notify', message);
      }
    }, 1000);
  };
}

module.exports.default = events;
