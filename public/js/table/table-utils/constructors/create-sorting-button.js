/**
 * Create a span for invoking sorting function.
 * @param {string} title
 * @param {object} dom
 * @returns {HTMLSpanElement}
 */
function createSortingButton(title, dom) {
  const sortingCont = document.createElement('span');
  sortingCont.classList.add('sorting-cont');

  const sortingBtn = document.createElement('span');
  sortingCont.append(sortingBtn);

  sortingBtn.setAttribute('title', title);
  sortingBtn.setAttribute('role', 'button');
  sortingBtn.classList.add('sorting-button');
  dom.addOnClick(sortingBtn, {
    funcName: 'sortColumn',
    funcArgs: [{ dom }],
  });

  return sortingCont;
}

export default createSortingButton;
