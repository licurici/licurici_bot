
var serialPort;

function bindReport(slackBot) {
  slackBot.add('/reports', [
    function (session) {
      var index = session.userData.treeIndex;

      serialPort.getReport(index, function(report) {
        session.send(report);
        session.endDialog();
      });
    }
  ]);
}

function bindShort(slackBot, mainDialog) {
  mainDialog.matches('rapoarte', function (session, result) {
    session.beginDialog('/reports');
  });

  mainDialog.matches('raport', function (session, result) {
    session.beginDialog('/reports');
  });
}

module.exports.bind = function(slackBot, mainDialog, serial) {
  bindReport(slackBot);
  bindShort(slackBot, mainDialog);

  serialPort = serial;
};
