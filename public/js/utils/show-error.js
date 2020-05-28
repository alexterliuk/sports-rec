function showError(message, errElem) {
  errElem.children[0].textContent = message;
  errElem.classList.add('active-error');
  errElem.style.display = 'inline-block';

  errElem.children[1].addEventListener('click', () => {
    errElem.style.display = '';
    errElem.children[0].textContent = '';
    errElem.classList.remove('active-error');
  })
}
