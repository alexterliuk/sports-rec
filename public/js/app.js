import createDashboard from './dashboard/create-dashboard.js';
import createTableContainer from './table/create-table-container.js';
import putBtnCloseToRight from './table/table-utils/put-btn-close-to-right.js';
import enactTogglePasswordView from './utils/enact-toggle-password-view.js';
import enactToggleSignMode from './utils/enact-toggle-sign-mode.js';
import { shownTables, savedTablesHyphenIds } from './table/state-collectors/index.js';
import { isLoggedIn, signIn, signUp, logOut, deleteUser } from './services/index.js';

function $listenToServerResponses(response, emitter, emitType) {
  const lib = {
    'sign-up'() {
      welcomeMessage.textContent = `Welcome, ${signUpUsername.value}.`;
      this._showLogInPanel();
      createDashboard();
    },
    'sign-in'() {
      welcomeMessage.textContent = `Welcome, ${signInUsername.value}.`;
      this._showLogInPanel();
      createDashboard(); // or call with options - e.g. createDashboard({ tablesQty: 20, maxTablesInDashboardPage: 5, maxButtonsInRow: 3 });
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

(function onPageLoad() {
  // Add event listeners for logging, creating/deleting user
  signInForm.addEventListener('submit', signIn);
  signUpForm.addEventListener('submit', signUp);
  pickElem('logOut').addEventListener('click', logOut);
  pickElem('deleteUser').addEventListener('click', deleteUser);

  // Make sure .btn-close is always on visual part of page at table's right upper corner.
  putBtnCloseToRight();
  window.addEventListener('resize', () => { putBtnCloseToRight(); });

  // Add Create New Table button to page
  const htmlStr = '<div class="buttons-block"><button id="createNewTable">Create New Table</button></div>';
  mainTableBlock.insertAdjacentHTML('beforebegin', htmlStr);
  pickElem('createNewTable').addEventListener('click', createTableContainer);

  enactTogglePasswordView();
  enactToggleSignMode();
})();

export default $emit;
