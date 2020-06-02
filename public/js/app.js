function $listenToServerResponses(response, emitter, emitType) {
  const lib = {
    'sign-up'() {
      welcomeMessage.textContent = `Welcome, ${signUpUsername.value}.`;
      this._showLogInPanel();
    },
    'sign-in'() {
      welcomeMessage.textContent = `Welcome, ${signInUsername.value}.`;
      this._showLogInPanel();
    },
    'log-out'() {
      signInUsername.value = '';
      signInPassword.value = '';
      signUpUsername.value = '';
      signUpPassword.value = '';
      this._showSignInPanel();
    },
    _showLogInPanel() {
      signInPanel.style.display = 'none';
      signUpPanel.style.display = 'none';
      logInPanel.style.display = 'block';
    },
    _showSignInPanel() {
      signInPanel.style.display = 'block';
      signInPanel.style.visibility = 'initial';
      signUpPanel.style.display = 'block';
      logInPanel.style.display = 'none';
      welcomeMessage.textContent = '';
    }
  };

  lib[emitType]();
}

function $emit(response, emitter, emitType) {
  return $listenToServerResponses(response, emitter, emitType);
}

// Check whether current session is under logged in user
(async () => {
  const response = await fetch('http:/is-logged-in', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 200) {
    const { name } = await response.json();
    welcomeMessage.textContent = `Welcome, ${name}.`;

    setTimeout(() => {
      $emit(undefined, undefined, '_showLogInPanel');
      signInPanel.classList.remove('spinner');
    }, 150);

  } else {
    signInPanel.classList.remove('spinner');
    signInPanel.style.visibility = 'initial';
  }
})();

// Decide whether to switch table to scrolling mode
(function onPageLoad() {
  const table = pickTags('table')[0];

  if (table.clientWidth > window.outerWidth) {
    table.style.overflowX = 'scroll';
    const rowWidth = window.getComputedStyle(pickElem('row0')).width;

    table.children[0].style.width = rowWidth;
    table.children[1].style.width = rowWidth;
  }

  window.addEventListener('resize', () => {
    const tables = pickTags('table');

    for (const table of tables) {
      if (table.clientWidth > window.outerWidth) {
        const rowWidth = window.getComputedStyle(pickElem('row0')).width;
        table.style.overflowX = 'scroll';

        table.children[0].style.width = rowWidth;
        table.children[1].style.width = rowWidth;
      }
    }
  });
})();
