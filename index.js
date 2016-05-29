var Botkit = require('botkit');
var builder = require('botbuilder');

var checkColor = require("./src/color");
var serialComunication = require('./src/serial.js');

var controller = Botkit.slackbot();
var bot = controller.spawn({
   token: "xoxb-32029623829-7Bp4OOjUlO6GF6RBi4XZnpvF"
});

serialComunication.init('/dev/cu.usbmodem1411');

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
  "Sa ne bucuram (nu e implementat)": "/animations/joy",
  "Sclipim": "/animations/flicker",
  "Sarim": "/animations/road",
  "Sa ne ascundem": "/animations/hide"
};

slackBot.add('/animations', [
    function (session) {
        builder.Prompts.choice(session, "Oare ce vrei sa facem?", animations);
    },
    function (session, results) {
      console.log("==>", animations[results.response.entity]);
      session.replaceDialog(animations[results.response.entity]);
    }
]);

slackBot.add('/animations/show', [
    function (session) {
      session.dialogData.action = {};
      session.dialogData.action.nr = 0;

      builder.Prompts.number(session, "Oare care grup se apara?");
    },
    function (session, results) {
      session.dialogData.action.group = results.response;
      serialComunication.do(session.dialogData.action, function(err) {
        if(err) {
          session.send("Nu putem aparea...");
          session.send(err);
        } else {
          session.send("Ne aratam!");
        }
      });
      session.endDialog();
    }
]);

slackBot.add('/animations/flicker', [
    function (session) {
      session.dialogData.action = {};
      session.dialogData.action.nr = 1;

      builder.Prompts.number(session, "Oare care grup sa sclipeasca?");
    },
    function (session, results) {
      session.dialogData.action.group = results.response;
      serialComunication.do(session.dialogData.action, function(err) {
        if(err) {
          session.send("Nu putem sclipi...");
          session.send(err);
        } else {
          session.send("Sclipim!");
        }
      });
      session.endDialog();
    }
]);


slackBot.add('/animations/road', [
    function (session) {
      session.dialogData.action = {};
      session.dialogData.action.nr = 2;

      builder.Prompts.number(session, "Oare care grup sa sara?");
    },
    function (session, results) {
      session.dialogData.action.group = results.response;
      serialComunication.do(session.dialogData.action, function(err) {
        if(err) {
          session.send("Nu putem sari...");
          session.send(err);
        } else {
          session.send("Sarim!");
        }
      });
      session.endDialog();
    }
]);

slackBot.add('/animations/hide', [
    function (session) {
      session.dialogData.action = {};
      session.dialogData.action.nr = 3;

      builder.Prompts.number(session, "Oare care grup se ascunde?");
    },
    function (session, results) {
      session.dialogData.action.group = results.response;
      builder.Prompts.number(session, "Care e procentul de licurici care se sting?");
    },
    function (session, results) {
      session.dialogData.action.percent = results.response;
      serialComunication.do(session.dialogData.action, function(err) {
        if(err) {
          session.send("Nu ne putem ascunde...");
          session.send(err);
        } else {
          session.send("Ne-am ascuns!");
        }
      });
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
    },
    function (session, results) {
      var color = session.dialogData.color;

      serialComunication.setColor(session.dialogData.color, function(err) {
        if(err) {
          session.send("Nu putem schimba culoarea...");
          session.send(err);
        } else {
          session.send('Schimbam culoarea! \n rosu: ' + color.red + ' verde: ' + color.green + ' albastru: ' + color.blue);
        }
      });

      session.endDialog();
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
      }
    }
]);
