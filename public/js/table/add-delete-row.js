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

  const _dom = dom || getBuildDOMLibrary();

  const theadRow = querySel(`#${tableId} thead tr`);
  if (!theadRow.children.length) return;

  const hyphenId = pickElem(tableId).dataset.hyphenId;
  const tbody = querySel(`#${tableId} tbody`);
  const row = tbody.insertRow();
  row.setAttribute('id', Array.isArray(spec.rowsIds) && spec.rowsIds[tbody.children.length - 1] || `row${tbody.children.length}${hyphenId}`);

  // [null].concat... - because at 0 index (row.rowIndex) is thead tr (see also addColumn)
  const textValues = Array.isArray(spec.cellsTextValues) && spec.cellsTextValues && [null].concat(spec.cellsTextValues);

  for (let i = 0; i < (row.previousElementSibling || theadRow).children.length; i++) {
    const cellId = getStoredCellIdOrMakeDefault(spec.cellsIds, row, i, hyphenId);
    const text = (textValues[row.rowIndex] || [])[row.children.length];

    const cell = createCell(row, cellId, text);

    if (spec.cellsClassNames) _dom.addClass(cell, spec.cellsClassNames[cell.id] || []);

    if (spec.cellsStyles) _dom.addStyle(cell, spec.cellsStyles[cell.id] || []);
    if (spec.cellsTextareaStyles) _dom.addStyle(querySel(`#${cell.id} textarea`), spec.cellsTextareaStyles[cell.id] || []);

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
