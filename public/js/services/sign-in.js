signInForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = signInUsername.value;
  const password = signInPassword.value;
  const errElem = querySel('#signInPanel .header-error');

  if (!errElem.classList.value.includes('active-error')) {
    if (!name || !password) {
      const message = 'Name and password fields are required.';
      showError(message, errElem);

    } else {
      const response = await fetch('http:/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (response.status === 400) {
        const message = 'Sign in to site failed. Make sure you haven\'t made a typo in your username or password.';
        showError(message, errElem);
      }

      if (response.status === 200) {
        $emit(response, signInForm, 'sign-in');
        mainTableBlock.dataset.username = name;
      }
    }
  }
});
