/**
 * Add editing block to element.
 * @param {HTMLTableDataCellElement | HTMLTableHeaderCellElement} elem
 * @returns {{ HTMLTextAreaElement, HTMLSpanElement }}
 */
function addTextareaAndHider(elem) {
  const textarea = document.createElement('textarea');
  elem.append(textarea);
  const resizerHider = document.createElement('span');
  resizerHider.classList.add('resizer-hider');
  elem.append(resizerHider);

  return { textarea, resizerHider };
}
