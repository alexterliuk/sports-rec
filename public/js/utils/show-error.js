/**
 * Show error in signIn, signUp or logIn panel.
 * @param {string} message
 * @param {HTMLElement} errElem
 */
function showError(message, errElem) {
  errElem.children[0].textContent = message;
  errElem.classList.add('active-error');
  errElem.style.display = 'inline-block';

  const prevElem = errElem.previousElementSibling;
  const needLink = pickElem(prevElem.id.slice(0, 6) === 'signIn' ? 'needSignUp' : 'needSignIn');
  needLink.classList.add('not-clickable');

  errElem.children[1].addEventListener('click', () => {
    errElem.style.display = '';
    errElem.children[0].textContent = '';
    errElem.classList.remove('active-error');
    needLink.classList.remove('not-clickable');
  });
}

export default showError;
