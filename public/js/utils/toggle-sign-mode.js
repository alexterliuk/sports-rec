for (const modeButton of document.getElementsByClassName('toggle-sign-mode')) {
  modeButton.addEventListener('click', event => {
    const id = event.target.id;
    const signInShowHide = querySel('#signInPanel .toggle-password-view');
    const signUpShowHide = querySel('#signUpPanel .toggle-password-view');

    if (!pickElem(id).classList.value.includes('not-clickable')) {
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
    }
  });
}
