/**
 * Add click listeners to show/hide password button.
 */
function enactTogglePasswordView() {
  for (const showButton of document.getElementsByClassName('toggle-password-view')) {
    showButton.addEventListener('click', event => {
      const passwordElement = pickElem(event.target.previousElementSibling.id);
      const node = event.target.childNodes[0];
      const content = node.textContent;

      if (node.textContent === 'show') {
        node.textContent = 'hide';
        passwordElement.setAttribute('type', '');

      } else {
        node.textContent = 'show';
        passwordElement.setAttribute('type', 'password');
      }
    });
  }
}

export default enactTogglePasswordView;
