import $emit from '../app.js';
import showError from '../utils/show-error.js';

async function deleteUser(event) {
  event.preventDefault();

  if (window.confirm('Are you sure to delete your account? Your tables will be deleted too.')) {
    const password = window.prompt('Please, type your password.');
    const errElem = querySel('#logInPanel .header-error');

    if (password) {
      const response = await fetch('/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.status === 200) {
        $emit(response, logInPanel, 'log-out');

      } else {
        const message = 'Failed to delete user. You probably made a typo in your password.';
        showError(message, errElem);
      }
    }
  }
}

export default deleteUser;
