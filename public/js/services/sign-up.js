(signUpForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = signUpUsername.value;
  const password = signUpPassword.value;
  const errElem = querySel('#signUpPanel .header-error');

  if (!errElem.classList.value.includes('active-error')) {
    if (!name || !password) {
      const message = 'Name and password fields are required.';
      showError(message, errElem);

    } else {
      const response = await fetch('/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (response.status === 400) {
        const message = 'Sign Up failed. Only letters, numbers and _ allowed. Name - max 20 chars, password - min 6 chars. The chosen name might belong to another user.';
        showError(message, errElem);
      }

      if (response.status === 201) {
        $emit(response, signUpForm, 'sign-up');
        mainTableBlock.dataset.username = name;
      }
    }
  }
}))();
