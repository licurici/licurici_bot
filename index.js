var Botkit = require('botkit');
var builder = require('botbuilder');

var checkColor = require("./src/color");

var controller = Botkit.slackbot();
var bot = controller.spawn({
   token: "xoxb-32029623829-7Bp4OOjUlO6GF6RBi4XZnpvF"
});

var slackBot = new builder.SlackBot(controller, bot);
slackBot.add('/', function (session) {
   session.beginDialog('/licurici');
});

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


var animations = {
  "Sa ne aratam": "/animations/show",
  "Sa ne bucuram": "/animations/joy",
  "Sclipim": "/animations/flicker",
  "Sarim": "/animations/road",
  "Sa ne ascundem": "/animations/hide"
};

slackBot.add('/animations', [
    function (session) {
        builder.Prompts.choice(session, "Oare ce vrei sa facem?", animations);
    },
    function (session, results) {
        session.endDialog();
    }
]);


var colors = {
  "Galben viu": "/colors/vividYellow",
  "Galbenish-Portocaliu": "/colors/yellowOrange",
  "Galbenish-Verde": "/colors/yellowGreen",
  "Verde": "/colors/green",
  "Alta": "/colors/other",
};

slackBot.add('/colors', [
    function (session) {
        builder.Prompts.choice(session, "Oare ce culoare vrei?", colors);
    },
    function (session, results) {
      session.replaceDialog(colors[results.response.entity]);
    }
]);

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

        var color = session.dialogData.color;

        session.send('Se va face!');
        session.send('rosu: ' + color.red + ' verde: ' + color.green + ' albastru: ' + color.blue);

        session.endDialog();
      }
    }
]);
