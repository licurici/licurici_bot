var Botkit = require('botkit');
var builder = require('botbuilder');

var colors = require("./src/color");
var thresholds = require("./src/thresholds");
var animations = require("./src/animations");
var reports = require("./src/reports");
var audio = require("./src/audio");
var distance = require("./src/distance");

var serialComunication = require('./src/serial');
var Events = require('./src/events.js').default;

var instagram = require('./src/instagram');
var twitter = require('./src/twitter');

var settings = require('./settings.js');

var connectedToSlack = false;

var controller = Botkit.slackbot();
var bot = controller.spawn({
   token: settings.slackToken
});

var slackBot = new builder.SlackBot(controller, bot, {
  minSendDelay: 100
});

var events = new Events(slackBot, settings.slackChannel);

var mainDialog = new builder.CommandDialog()
  .onDefault(function (session) {
    session.beginDialog('/licurici');
  });

slackBot.add('/', mainDialog);
slackBot.listenForMentions();

serialComunication.init(settings.serialPorts, events.send, audio.event, distance.event);
audio.bind(serialComunication);
distance.bind(serialComunication, audio.closeEvent);

setTimeout(function() {
  serialComunication.allHappy();
}, 1000);

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }

  console.log("Connected to slack.");

  instagram.init(serialComunication, slackBot);
  twitter.init(serialComunication, slackBot);

  setTimeout(function() {
    serialComunication.allHappy();
  }, 1000);

  connectedToSlack = true;
});

var actions = {
    "Alege copacul": "/tree",
    "Schimba animatie": "/animations",
    "Schimba culoarea": "/colors",
    "Schimba limita audio": "/threshold/audio",
    "Schimba limita lumina": "/threshold/light",
    "Stamina": "/stamina",
    "Rapoarte": "/reports"
};

slackBot.add('/tree', [
    function (session) {
      builder.Prompts.number(session, "Alege copacul");
    }, function (session, response) {
      if(response.response < 0 && response.response > settings.serialPorts.length - 1) {
        response.response = 0;
      }

      session.userData.treeIndex = response.response;
      session.endDialog();
    }
]);

slackBot.add('/notify', [
    function (session, message) {
      session.send(message);
      session.endDialog();
    }
]);

slackBot.add('/stamina', [
    function (session, message) {
      serialComunication.stamina(session.userData.treeIndex, function(err) {
        session.send(err ? "Nu merge stamina..." : "Stamina!");
        session.endDialog();
      });
    }
]);

slackBot.add('/licurici', [
    function (session) {
      if(session.userData.treeIndex === undefined || session.userData.treeIndex === null) {
        session.beginDialog("/tree");
      } else {
        builder.Prompts.choice(session, "Ce vrei sa facem in *copacul " + session.userData.treeIndex + "*?", actions);
      }
    },
    function (session, results) {
      session.userData.name = results.response;
      session.beginDialog(actions[results.response.entity]);
    }
]);

animations.bind(slackBot, mainDialog);
colors.bind(slackBot, mainDialog);
thresholds.bind(slackBot, mainDialog);
reports.bind(slackBot, mainDialog, serialComunication);

