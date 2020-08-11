/**
 * Create button to turn on/off editing of column's title.
 * @returns {HTMLSpanElement}
 */
function createEditButton() {
  const editBtn = document.createElement('span');
  editBtn.classList.add('edit-button');
  editBtn.setAttribute('title', 'Edit column title');
  editBtn.setAttribute('role', 'button');
  editBtn.textContent = 'e';

  editBtn.addEventListener('click', event => {
    const th = event.target.parentElement;
    const editMask = querySel(`#${th.id} .edit-mask`);
    const textarea = querySel(`#${th.id} textarea`);

    if (editBtn.classList.value.includes('active')) {
      editBtn.classList.remove('active');
      editMask.style.display = 'initial';
      textarea.style.backgroundColor = '';

    } else {
      editBtn.classList.add('active');
      editMask.style.display = 'none';
      textarea.focus();
      textarea.style.backgroundColor = '#7593b1';
    }
  });

  return editBtn;
}

export default createEditButton;
