/**
 * Create span to cover textarea so that it is not editable.
 * @returns {HTMLSpanElement}
 */
function createEditMask() {
  const editMask = document.createElement('span');
  editMask.classList.add('edit-mask');

  return editMask;
}

export default createEditMask;
