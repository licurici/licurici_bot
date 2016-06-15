var builder = require('botbuilder');
var serialComunication = require('./serial');


function bindQuiz(slackBot) {

  slackBot.add('/threshold/audio', [
      function (session) {
        builder.Prompts.number(session, "Noua limita pt sunet?");
      },

      function (session, results) {
        var index = session.userData.treeIndex;

        if(!isNaN(results.response)) {
          serialComunication.setAudioThreshold(index, results.response, function(err) {
            session.send(err ? "Nu am putut seta limita audio" : "Limita audio setata" );
            session.endDialog();
          });
        }
      }
  ]);

  slackBot.add('/threshold/light', [
      function (session) {
        builder.Prompts.number(session, "Noua limita pt lumina?");
      },

      function (session, results) {
        var index = session.userData.treeIndex;

        if(!isNaN(results.response)) {
          serialComunication.setLightThreshold(index, results.response, function(err) {
            session.send(err ? "Nu am putut seta limita de lumina" : "Limita de lumina setata" );
            session.endDialog();
          });
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
