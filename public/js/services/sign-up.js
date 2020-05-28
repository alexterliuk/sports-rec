const signUpForm = document.querySelector('#signUpPanel form');

signUpForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = pickElem('signUpUsername').value;
  const password = pickElem('signUpPassword').value;
  const errElem = querySel('#signUpPanel .err-msg');

  if (!errElem.classList.value.includes('active-error')) {
    if (!name || !password) {
      const message = 'Name and password fields are required.';
      showError(message, errElem);

    } else {
      const response = await fetch('http:/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (response.status === 400) {
        const message = 'User saving failed. Only letters, numbers and underscores allowed. Max length of name - 20 chars, min length of password - 6 chars.';
        showError(message, errElem);
      }

      if (response.status === 201) {
        $emit(response, signUpForm, 'sign-up');
      }
    }
  }
});
