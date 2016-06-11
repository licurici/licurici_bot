var builder = require('botbuilder');
var serialComunication = require('./serial');

var colors = {
  "Galben viu": { red: 10, green: 10, blue: 5},
  "Galbenish-Portocaliu": { red: 10, green: 8, blue: 5},
  "Galbenish-Verde": { red: 8, green: 10, blue: 5},
  "Verde": { red: 0, green: 10, blue: 0},
  "Alta": "/colors/other",
};


function checkColor(session, value) {
  value = parseInt(value);

  if(isNaN(value) || value < 0 || value > 20) {
    session.send('Culoarea trebuie sa fie un numar de la 0 la 20');
    session.endDialog();

    return false;
  }

  return true;
}

function bindQuiz(slackBot) {

  slackBot.add('/colors', [
      function (session) {
        builder.Prompts.choice(session, "Oare ce culoare vrei?", colors);
      },
      function (session, results) {

        if(typeof colors[results.response.entity] == 'string') {
          session.replaceDialog(colors[results.response.entity]);
        } else {
          updateColor(session, colors[results.response.entity]);
          session.endDialog();
        }
      }
  ]);

  function updateColor(session, color) {
    serialComunication.setColor(color, function(err) {
      if(err) {
        session.send("Nu putem schimba culoarea...");
        session.send(err);
      } else {
        session.send('Schimbam culoarea! \n rosu: ' + color.red + ' verde: ' + color.green + ' albastru: ' + color.blue);
      }
    });
  }

  slackBot.add('/colors/other', [
      function (session) {
        session.dialogData.color = {};
        builder.Prompts.number(session, "Cat rosu?");
      },
      function (session, results) {
        if(checkColor(session, results.response)) {
          session.dialogData.color.red = results.response;
          builder.Prompts.number(session, "verde?");
        }
      },
      function (session, results) {
        if(checkColor(session, results.response)) {
          session.dialogData.color.green = results.response;
          builder.Prompts.number(session, "albastru?");
        }
      },
      function (session, results) {
        if(checkColor(session, results.response)) {
          session.dialogData.color.blue = results.response;
          updateColor(session, session.dialogData.color);
          session.endDialog();
        }
      }
  ]);
}

function bindShort() {

}

module.exports.bind = function(slackBot, mainDialog) {
  bindQuiz(slackBot);
  bindShort(slackBot, mainDialog);
};
