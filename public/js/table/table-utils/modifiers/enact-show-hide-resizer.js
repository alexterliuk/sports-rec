/**
 * Display/hide textarea's resizer at right bottom corner.
 * @param {HTMLTextAreaElement} txtAr
 */
function enactShowHideResizer(txtAr) {
  txtAr.addEventListener('focus', () => { setDisplayTo('none'); });
  txtAr.addEventListener('blur', () => { setDisplayTo('initial'); });

  function setDisplayTo(val) {
    for (const child of txtAr.parentElement.children) {
      if (child.classList.value.includes('resizer-hider')) {
        child.style.display = val;
        break;
      }
    }
  }
}

export default enactShowHideResizer;
