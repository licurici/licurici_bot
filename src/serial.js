var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var ports = [];
var reportCallback = null;
var gettingReport = false;
var reportData = "";

serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

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

module.exports.init = function(serialPorts, eventFunction, audioFunction, distanceFunction) {
  serialPorts.forEach(function(name) {
    var portIndex = -1;

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

      if(data.indexOf("audio-level:") == 0) {
        var audio = parseInt(data.split(":")[1]);
        audioFunction(audio);

        return;
      }

      if(data.indexOf("hide:") == 0) {
        var percent = parseInt(data.split(":")[1]);
        ports.forEach((port, index) => {
          if(index != portIndex) {
            port.write('14\r\n' + percent + '\r\n', function(err, bytesWritten) {
            });
          }
        });

        return;
      }

      if(portIndex == 0 && data.indexOf("color:") == 0) {
        var color = parseInt(data.split(":")[1]);

        ports.forEach((port, index) => {
          if(index > 0) {
            port.write('15\r\n' + color + '\r\n', function(err, bytesWritten) {
            });
          }
        });

        return;
      }

      if(data.indexOf("distance to object in cm: ") == 0) {
        var distance = parseInt(data.split(":")[1]);
        distanceFunction(name, distance);
        return;
      }

      if(gettingReport) {
        reportData += data + "\n";
      } else {
        data = data.toString().trim();
        var event = data.split(" ")[0];

        if(data.indexOf("Hiding") == -1 && data.indexOf("SoundDetected") == -1 && data !== "" && isEvent(event)) {
          if(eventFunction) {
            eventFunction(event, data);
          }
        }
      }
    });

    portIndex = ports.length;
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

module.exports.updateAudioLevel = function() {
  ports.forEach((port) => {
    port.write('11\r\n', function(err, bytesWritten) { });
  });
};

module.exports.readDistance = function() {
  ports.forEach((port) => {
    port.write('12\r\n');
  });
}

module.exports.hilightFlicker = function() {
  ports.forEach((port) => {
    port.write('13\r\n');
  });
}
