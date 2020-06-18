/**
 * Add new row to table.
 * @param {HTMLButtonElement} btn
 * @param {object} spec
 * @param {object} dom - buildDOMLibrary
 */
function addRow(btn, spec, dom) {
  const { tableId } = spec;
  if (!tableId) {
    console.error('Failed to add row, because no tableId provided.');
    return;
  }

  const theadRow = querySel(`#${tableId} thead tr`);
  if (!theadRow.children.length) return;

  const hyphenId = pickElem(tableId).dataset.hyphenId;
  const tbody = querySel(`#${tableId} tbody`);
  const row = tbody.insertRow();
  row.setAttribute('id', `row${tbody.children.length}${hyphenId}`);

  const textValues = Array.isArray(spec.cellsTextValues) && spec.cellsTextValues;

  for (let i = 0; i < (row.previousElementSibling || theadRow).children.length; i++) {
    const cellId = `r${row.rowIndex}c${i}${hyphenId}`;
    const text = (textValues[row.rowIndex] || [])[row.children.length];

    const cell = createCell(row, cellId, text);

    if (i === 0) {
      cell.append(createDelStick('Delete row', deleteRow));
    }
  }
}

/**
 * Delete row.
 */
function deleteRow() {
  const tr = this.parentElement.parentElement;
  const tbody = tr.parentElement;
  tbody.removeChild(tr);
}
