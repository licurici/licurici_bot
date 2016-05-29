


module.exports = function(session, value) {

  value = parseInt(value);

  if(isNaN(value) || value < 0 || value > 20) {
    session.send('Culoarea trebuie sa fie un numar de la 0 la 20');
    session.endDialog();

    return false;
  }

  return true;
};
