/**
 * Create cell.
 * @param {HTMLTableRowElement} row
 * @param {string} cellId
 * @param {string} textValue
 * @returns {HTMLTableDataCellElement}
 */
function createCell(row, cellId, textValue) {
  const cell = row.insertCell();
  cell.setAttribute('id', cellId);
  const { textarea } = addTextareaAndHider(cell);
  textarea.value = textValue || '';

  if (row.children.length > 1) {
    const rowDefaultHeight = parsedCssVars.find(parsed => parsed.varKey === '--rowDefaultHeight').vals[0].px;
    const rowActualHeight = row.getBoundingClientRect().height;

    if (rowActualHeight > rowDefaultHeight + 1) { // +1 to cover Firefox getBoundingClientRect's float number output (Chrome outputs integer)
      cell.style.height = row.children[row.children.length - 2].style.height;
      textarea.style.height = querySel(`#${row.children[row.children.length - 2].id} textarea`).style.height;
    }
  }

  enactShowHideResizer(textarea);
  watch('textareaHeight', textarea);

  return cell;
}
