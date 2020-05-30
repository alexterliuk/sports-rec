// global variables
const pickElem = id => document.getElementById(id);
const querySel = sel => document.querySelector(sel);

function $listenToServerResponses(response, emitter, emitType) {
  const lib = {
    'sign-up'() {
      querySel('#logInPanel span:first-child').textContent = `Welcome, ${pickElem('signUpUsername').value}.`;
      this._showLogInPanel();
    },
    'sign-in'() {
      querySel('#logInPanel span:first-child').textContent = `Welcome, ${pickElem('signInUsername').value}.`;
      this._showLogInPanel();
    },
    _showLogInPanel() {
      pickElem('signUpPanel').style.display = 'none';
      pickElem('signInPanel').style.display = 'none';
      pickElem('logInPanel').style.display = 'block';
    },
  };

  lib[emitType]();
}

function $emit(response, emitter, emitType) {
  return $listenToServerResponses(response, emitter, emitType);
}

// Check whether current session is under logged in user
(async () => {
  const signInPanel = pickElem('signInPanel');

  const response = await fetch('http:/is-logged-in', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 200) {
    const { name } = await response.json();
    querySel('#logInPanel span:first-child').textContent = `Welcome, ${name}`;

    setTimeout(() => {
      $emit(undefined, undefined, '_showLogInPanel');
      signInPanel.classList.remove('spinner');
    }, 150);

  } else {
    signInPanel.classList.remove('spinner');
    signInPanel.style.visibility = 'initial';
  }
})();
