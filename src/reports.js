
var serialPort;

function bindReport(slackBot) {
  slackBot.add('/reports', [
    function (session) {
      serialPort.getReport(function(report) {
        session.send(report);
        session.endDialog();
      });
    }
  ]);
}

function bindShort(slackBot, mainDialog) {

}


module.exports.bind = function(slackBot, mainDialog, serial) {
  bindReport(slackBot);
  bindShort(slackBot, mainDialog);

  serialPort = serial;
};
