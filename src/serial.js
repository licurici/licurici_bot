var SerialPort = require('serialport').SerialPort;
var port;



module.exports.init = function(name) {

  port = new SerialPort(name);

  port.on('open', function () {
    console.log("Connected to", name);
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
