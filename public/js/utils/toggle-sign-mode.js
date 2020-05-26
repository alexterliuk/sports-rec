for (const modeButton of document.getElementsByClassName('toggle-sign-mode')) {
  modeButton.addEventListener('click', event => {
    const id = event.target.id;

    const signInPanel = document.getElementById('signInPanel');
    const signInUsername = document.getElementById('signInUsername');
    const signInPassword = document.getElementById('signInPassword');
    const signInShowHide = document.querySelector('#signInPanel .toggle-password-view');

    const signUpPanel = document.getElementById('signUpPanel');
    const signUpUsername = document.getElementById('signUpUsername');
    const signUpPassword = document.getElementById('signUpPassword');
    const signUpShowHide = document.querySelector('#signUpPanel .toggle-password-view');

    if (id === 'needSignUp') {
      signInPanel.style.marginLeft = '600px';
      signInUsername.value = '';
      signInPassword.value = '';
      signInPassword.setAttribute('type', 'password');
      signInShowHide.textContent = 'show';
      signUpPanel.style.marginTop = '-83px';
    } else {
      signUpPanel.style.marginTop = '-332px';
      signUpUsername.value = '';
      signUpPassword.value = '';
      signUpPassword.setAttribute('type', 'password');
      signUpShowHide.textContent = 'show';
      signInPanel.style.marginLeft = '0';
    }
  });
}
