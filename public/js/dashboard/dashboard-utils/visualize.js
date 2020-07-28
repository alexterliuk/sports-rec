/**
 * Show/hide spinner, then append element.
 * @param parentNode
 * @param childNode
 * @param duration
 */
function visualizeWhileAppending(parentNode, childNode, duration) {
  const time = typeof duration === 'number' && duration || 0;

  setTimeout(() => {
    parentNode.classList.add('spinner');
  }, time);

  setTimeout(() => {
    if (childNode) parentNode.append(childNode);
    // shownTables.add(hyphenId);
    parentNode.classList.remove('spinner');
  }, time + 100);
}

/**
 * Show/hide spinner, then remove element.
 * @param {HTMLElement} parentNode
 * @param {HTMLElement} childNode
 * @param {string} hyphenId
 * @param {number} duration
 */
function visualizeThenRemove(parentNode, childNode, hyphenId, duration) {
  const time = typeof duration === 'number' && duration || 3000;

  setTimeout(() => {
    parentNode.classList.add('spinner');
  }, time);

  setTimeout(() => {
    if (childNode) childNode.remove(); // remove dboItem from dashboardInfo
    shownTables.remove(hyphenId); // remove table from mainTableBlock
    parentNode.classList.remove('spinner');
  }, time + 500); // time to show/hide notify
}
