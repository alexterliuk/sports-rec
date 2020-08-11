import $emit from '../app.js';

async function logOut(event) {
  event.preventDefault();

  const response = await fetch('/log-out', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 200) {
    $emit(response, logInPanel, 'log-out');
  }
}

export default logOut;
