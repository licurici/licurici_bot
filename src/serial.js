var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var ports = [];
var reportCallback = null;
var gettingReport = false;
var reportData = "";

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

module.exports.init = function(serialPorts, eventFunction) {
  serialPorts.forEach(function(name) {
    port = new SerialPort(name, {
      parser: serialport.parsers.readline('\r\n')
    });

    port.on('open', function () {
      console.log("Connected to", name);
    });

    port.on('data', function (data) {
      if(data === "BEGIN REPORT") {
        gettingReport = true;
        reportData = "";
        return;
      }

      if(data === "END REPORT") {
        gettingReport = false;

        if(reportCallback) {
          reportCallback(reportData);
        }

        reportCallback = null;
      }

      if(gettingReport) {
        reportData += data + "\n";
      } else {
        data = data.toString().trim();
        var event = data.split(" ")[0];

        if(data !== "" && isEvent(event)) {
          if(eventFunction) {
            eventFunction(event, data);
          }
        }
      }
    });

    ports.push(port);
  });
};


function send(index, action, group, callback) {
  ports[index].write(action + '\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    ports[index].write(group + '\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
}

function getReport(index, callback) {
  ports[index].write('6\r\n', function(err, bytesWritten) {
    reportCallback = callback;
  });
}

function allHappy() {
  ports.forEach(function(port) {
    port.write('7\r\n');
  });
}

function hideAction(index, group, percent, callback) {
  send(index, 4, group, function(err) {
    if (err) {
      return callback(err);
    }

    ports[index].write(percent + '\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
}

module.exports.getReport = getReport;
module.exports.allHappy = allHappy;

module.exports.do = function(index, action, callback) {

  if(action.nr == 4) {
    hideAction(index, action.group, action.percent, callback);
  } else if(action.nr >= 0 && action.nr < 4) {
    send(index, action.nr, action.group, callback);
  } else {
    callback("Unknown action " + action.nr);
  }
};

module.exports.setColor = function(index, color, callback) {
  ports[index].write('5\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    ports[index].write(color.red +'\r\n' + color.green +'\r\n' + color.blue +'\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};

module.exports.setAudioThreshold = function(index, value, callback) {
  ports[index].write('9\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    ports[index].write(value +'\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};

module.exports.setLightThreshold = function(index, value, callback) {
  ports[index].write('10\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    ports[index].write(value +'\r\n', function(err, bytesWritten) {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};

module.exports.stamina = function(index, callback) {
  ports[index].write('8\r\n', function(err, bytesWritten) {
    if (err) {
      return callback(err);
    }

    console.log("done stamina");

    callback(null);
  });
};
