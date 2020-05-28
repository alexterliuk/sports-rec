// global variables
const pickElem = id => document.getElementById(id);
const querySel = sel => document.querySelector(sel);

function $listenToServerResponses(response, emitter, emitType) {
  const lib = {
    'sign-up'() {
      querySel('#logInPanel span:first-child').textContent = `Welcome, ${pickElem('signUpUsername').value}.`;
      this._showLogInPanel();
    },
    _showLogInPanel() {
      pickElem('signUpPanel').style.display = 'none';
      pickElem('signInPanel').style.display = 'none';
      pickElem('logInPanel').style.display = 'block';
    }
  };

  lib[emitType]();
}

function $emit(response, emitter, emitType) {
  return $listenToServerResponses(response, emitter, emitType);
}
