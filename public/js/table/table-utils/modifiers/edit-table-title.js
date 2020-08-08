/**
 * Edit table title.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 */
function editTableTitle(btn, { id }) {
  const title = querySel(`#${id} .table-title-container .table-title`);
  const input = querySel(`#${id} .table-title-container input`);
  const inputValueOrig = title.textContent || 'Table';
  const ok = querySel(`#${id} .table-title-container .btn-ok`);

  input.value = title.textContent;
  setDisplayTo('none', title);
  setDisplayTo('block', input, ok);

  ok.addEventListener('click', changeTitle);
  input.addEventListener('keydown', event => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      changeTitle();
    }
  });

  function setDisplayTo(type, ...elems) {
    for (const el of elems) el.style.display = type;
  }

  function changeTitle() {
    title.textContent = !isEmptyString(input.value) && input.value || inputValueOrig;
    setDisplayTo('none', input, ok);
    setDisplayTo('block', title);

    ok.removeEventListener('click', changeTitle);
    input.removeEventListener('keydown', changeTitle);
  }
}

export default editTableTitle;
