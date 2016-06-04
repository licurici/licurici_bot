var Botkit = require('botkit');
var builder = require('botbuilder');

var checkColor = require("./src/color");
var animations = require("./src/animations");
var serialComunication = require('./src/serial');

var settings = require('./settings.js');

var controller = Botkit.slackbot();
var bot = controller.spawn({
   token: settings.slackToken
});

serialComunication.init(settings.serialPort);

var slackBot = new builder.SlackBot(controller, bot, {
  minSendDelay: 100
});


slackBot.beginDialog({ from: alarm.from, to: alarm.to }, '/notify', alarm);

var mainDialog = new builder.CommandDialog()
  .onDefault(function (session) {
    session.beginDialog('/licurici');
  });

slackBot.add('/', mainDialog);

slackBot.listenForMentions();

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

var actions = {
    "Schimba animatie": "/animations",
    "Schimba culoarea": "/colors",
    "Rapoarte": "/reports"
};

slackBot.add('/licurici', [
    function (session) {
        builder.Prompts.choice(session, "Ce vrei sa facem?", actions);
    },
    function (session, results) {
      session.userData.name = results.response;

      session.replaceDialog(actions[results.response.entity]);
    }
]);

animations.bind(slackBot, mainDialog);

var colors = {
  "Galben viu": { red: 10, green: 10, blue: 5},
  "Galbenish-Portocaliu": { red: 10, green: 8, blue: 5},
  "Galbenish-Verde": { red: 8, green: 10, blue: 5},
  "Verde": { red: 0, green: 10, blue: 0},
  "Alta": "/colors/other",
};

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
