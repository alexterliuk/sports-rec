function $listenToServerResponses(response, emitter, emitType) {
  const lib = {
    'sign-up'() {
      welcomeMessage.textContent = `Welcome, ${signUpUsername.value}.`;
      this._showLogInPanel();
      createDashboard(); // or call with options - createDashboard({ tablesQty: 50, maxTablesOnPage: 10, maxButtonsInRow: 5 });
    },
    'sign-in'() {
      welcomeMessage.textContent = `Welcome, ${signInUsername.value}.`;
      this._showLogInPanel();
      createDashboard();
    },
    'log-out'() {
      mainTableBlock.dataset.username = '';
      signInUsername.value = '';
      signInPassword.value = '';
      signUpUsername.value = '';
      signUpPassword.value = '';
      this._showSignInPanel();
      pickElem('dashboardBlock').remove();
      shownTables.removeAll();
      savedTablesHyphenIds.remove();

      let stop = 0;
      while (mainTableBlock.children.length) {
        mainTableBlock.removeChild(mainTableBlock.children[0]);
        if (++stop === 1000) break;
      }
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
  const user = await isLoggedIn();

  if ((user || {}).name) {
    welcomeMessage.textContent = `Welcome, ${user.name}.`;
    mainTableBlock.dataset.username = user.name;

    setTimeout(() => {
      createDashboard();
    }, 150);

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
  toggleScrollMode(querySelAll('.table-panel'));

  window.addEventListener('resize', () => {
    toggleScrollMode(querySelAll('.table-panel'));
  });
})();
