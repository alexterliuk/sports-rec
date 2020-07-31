/**
 * Create a span for invoking sorting function.
 * @param {string} title
 * @param {function} callback
 * @returns {HTMLSpanElement}
 */
function createSortingButton(title, callback) {
  const sortingCont = document.createElement('span');
  sortingCont.classList.add('sorting-cont');
  const sortingBtn = document.createElement('span');
  sortingCont.append(sortingBtn);
  sortingBtn.setAttribute('title', title);
  sortingBtn.setAttribute('role', 'button');
  sortingBtn.classList.add('sorting-button');
  sortingBtn.addEventListener('click', callback);

  return sortingCont;
}
