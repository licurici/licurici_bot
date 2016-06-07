
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
  mainDialog.matches('rapoarte', function (session, result) {
    session.replaceDialog('/reports');
  });

  mainDialog.matches('raport', function (session, result) {
    session.replaceDialog('/reports');
  });
}

module.exports.bind = function(slackBot, mainDialog, serial) {
  bindReport(slackBot);
  bindShort(slackBot, mainDialog);

  serialPort = serial;
};
