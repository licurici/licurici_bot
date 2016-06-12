var builder = require('botbuilder');
var serialComunication = require('./serial');

var animations = {
  "Sa ne aratam": "/animations/show",
  "Sa ne bucuram": "/animations/happy",
  "Sclipim": "/animations/flicker",
  "Sarim": "/animations/road",
  "Sa ne ascundem": "/animations/hide"
};

function bindQuiz(slackBot) {
  slackBot.add('/animations', [
    function (session) {
      builder.Prompts.choice(session, "Oare ce vrei sa facem?", animations);
    },
    function (session, results) {
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
        var index = session.userData.treeIndex;
        session.dialogData.action.group = results.response;

        serialComunication.do(index, session.dialogData.action, function(err) {
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
        session.dialogData.action.nr = 2;

        builder.Prompts.number(session, "Oare care grup sa sclipeasca?");
      },
      function (session, results) {
        var index = session.userData.treeIndex;

        session.dialogData.action.group = results.response;
        serialComunication.do(index, session.dialogData.action, function(err) {
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

  slackBot.add('/animations/happy', [
      function (session) {
        session.dialogData.action = {};
        session.dialogData.action.nr = 1;

        builder.Prompts.number(session, "Oare care grup sa se bucure?");
      },
      function (session, results) {
        var index = session.userData.treeIndex;

        session.dialogData.action.group = results.response;
        serialComunication.do(index, session.dialogData.action, function(err) {
          if(err) {
            session.send("Nu putem sa ne bucuram...");
            session.send(err);
          } else {
            session.send("Ne bucuram!!");
          }
        });
        session.endDialog();
      }
  ]);

  slackBot.add('/animations/road', [
      function (session) {
        session.dialogData.action = {};
        session.dialogData.action.nr = 3;

        builder.Prompts.number(session, "Oare care grup sa sara?");
      },
      function (session, results) {
        var index = session.userData.treeIndex;

        session.dialogData.action.group = results.response;
        serialComunication.do(index, session.dialogData.action, function(err) {
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
        session.dialogData.action.nr = 4;

        builder.Prompts.number(session, "Oare care grup se ascunde?");
      },
      function (session, results) {
        session.dialogData.action.group = results.response;
        builder.Prompts.number(session, "Care e procentul de licurici care se sting?");
      },
      function (session, results) {
        var index = session.userData.treeIndex;

        session.dialogData.action.percent = results.response;
        serialComunication.do(index, session.dialogData.action, function(err) {
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
}

function bindShort(slackBot, mainDialog) {
  mainDialog.matches('^arata grupul [0-9]+', function (session, result) {
    var pieces = result.matches[0].split(" ");
    var group = parseInt(pieces[2]);

    serialComunication.do({nr: 0, group: group}, function(err) {
      if(err) {
        session.send("Nu putem aparea...");
        session.send(err);
      } else {
        session.send("Ne aratam!");
      }
    });
  });

  mainDialog.matches('^ascunde grupul [0-9]+( [0-9]+%){0,1}', function (session, result) {
    var pieces = result.matches[0].split(" ");
    var group = parseInt(pieces[2]);
    var percent = parseInt(pieces[3]);

    if(isNaN(percent) || percent < 0 || percent > 100) {
      percent = 100;
    }

    console.log(pieces);

    serialComunication.do({nr: 3, group: group, percent: percent}, function(err) {
      if(err) {
        session.send("Nu ne putem ascunde...");
        session.send(err);
      } else {
        session.send("Ne ascundem!");
      }
    });
  });

    mainDialog.matches('^grupul [0-9]+ [a-zA-Z]+', function (session, result) {
      var pieces = result.matches[0].split(" ");
      var group = parseInt(pieces[1]);
      var actiune = pieces[2];
      var nr = null;

      if(actiune == "sclipeste") {
        nr = 1;
      } else if(actiune == "sare") {
        nr = 2;
      }

      if(nr) {
        serialComunication.do({nr: nr, group: group}, function(err) {
          if(err) {
            session.send("Nu putem...");
            session.send(err);
          } else {
            session.send("gata!");
          }
        });
      } else {
        session.send("nu stiu ce e " + actiune + ". Ma asteptam la `sclipeste` sau `sare`");
      }
    });
}

module.exports.bind = function(slackBot, mainDialog) {
  bindQuiz(slackBot);
  bindShort(slackBot, mainDialog);
};
