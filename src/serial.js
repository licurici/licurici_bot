var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var port;

var events = ["SoundDetected", "Hiding"];

function isEvent(data) {

  var result = false;

  events.forEach(function(event) {
    if(event === data) {
      result = true;
    }
  });

  return result;
}

module.exports.init = function(name, eventFunction) {

  port = new SerialPort(name, {
    parser: serialport.parsers.readline('\r\n')
  });

  port.on('open', function () {
    console.log("Connected to", name);
  });

  port.on('data', function (data) {
    data = data.toString().trim();
    var event = data.split(" ")[0];

    if(data !== "" && isEvent(event)) {
      if(eventFunction) {
        eventFunction(event, data);
      }
    }

  });
};


function send(action, group, callback) {
  port.write(action + '\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    port.write(group + '\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
}

function show(group, callback) {
  send(0, group, callback);
}

function flickerAction(group, callback) {
  send(1, group, callback);
}

function roadAction(group, callback) {
  send(2, group, callback);
}

function hideAction(group, percent, callback) {
  send(3, group, function(err) {
    if (err) {
      return callback(err);
    }

    port.write(percent + '\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
}


module.exports.do = function(action, callback) {

  if(action.nr == 3) {
    hideAction(action.group, action.percent, callback);
  } else if(action.nr >= 0 && action.nr < 3) {
    send(action.nr, action.group, callback);
  } else {
    callback("Unknown action " + action.nr);
  }
};

module.exports.setColor = function(color, callback) {
  port.write('4\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    port.write(color.red +'\r\n' + color.green +'\r\n' + color.blue +'\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};
