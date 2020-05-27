const signUpForm = document.querySelector('#signUpPanel form');

signUpForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = document.getElementById('signUpUsername').value;
  const password = document.getElementById('signUpPassword').value;

  const response = await fetch('http:/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
  });
});
