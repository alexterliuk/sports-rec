/**
 * Add new column to table. A new table is created by this function by column-by-column way.
 * @param {HTMLButtonElement} btn
 * @param {object} spec
 * @param {object} dom - buildDOMLibrary
 */
function addColumn(btn, spec, dom) {
  if (!spec.tableId) {
    console.error('Failed to add column, because no tableId provided.');
    return;
  }

  const tablePanel = pickElem(spec.tableId).parentElement;
  const hyphenId = pickElem(spec.tableId).dataset.hyphenId;
  const theadRow = querySel(`#${spec.tableId} thead tr`);
  const tbody = querySel(`#${spec.tableId} tbody`);
  const th = document.createElement('th');

  const currentColIndex = theadRow.children.length;
  const colIdSpec = Array.isArray(spec.columnsIds) && spec.columnsIds[currentColIndex];
  const colIdSpecWithHyphenIdEnding = typeof colIdSpec === 'string' && colIdSpec.slice(-4) === hyphenId && colIdSpec;
  const colId = colIdSpecWithHyphenIdEnding || `${colIdSpec || 'col' + (currentColIndex + 1)}${hyphenId}`;

  th.setAttribute('id', colId);

  addTextareaAndHider(th);

  const currentTable = tables.get(hyphenId);
  currentTable.columnsIds = (currentTable.columnsIds || []).concat(colId);

  Object.keys(spec).forEach(key => {
    if (!currentTable.hasOwnProperty(key)) {
      if (key !== 'columnsIds') {
        currentTable[key] = spec[key];
      }
    }
  });

  th.append(createEditMask());
  th.append(createEditButton());
  th.append(createDelStick('Delete column', deleteColumn));

  if ((currentTable.onClick || {}).funcName === 'sortColumn') {
    th.append(createSortingButton('Sort column', sortColumn));
  }

  (dom || getBuildDOMLibrary()).hangOnElem(th, currentTable);
  theadRow.append(th);

  if (spec.columnsNames && Array.isArray(spec.columnsNames)) {
    querySel(`#${th.id} textarea`).value = spec.columnsNames[th.cellIndex] || '';
  }

  if (theadRow.children.length === 1) {
    const rowsQtySpec = Array.isArray(spec.cellsTextValues) && spec.cellsTextValues;
    const rowsQty = rowsQtySpec && rowsQtySpec.length || tables.getConfigItem('rowsQty');

    for (let i = 0; i < rowsQty; ++i) {
      addRow(null, spec, getBuildDOMLibrary());
    }

  } else { // [null].concat... - because at 0 index (row.rowIndex) is thead tr (see also addRow)
    const textValues = Array.isArray(spec.cellsTextValues) && spec.cellsTextValues && [null].concat(spec.cellsTextValues);

    for (const row of tbody.children) {
      const cellId = `r${row.rowIndex}c${row.children.length}${hyphenId}`;
      const text = (textValues[row.rowIndex] || [])[row.children.length];

      createCell(row, cellId, text);
    }
  }

  toggleScrollMode(tablePanel);
}

/**
 * Delete column.
 * @param {Event} event
 */
function deleteColumn(event) {
  event.stopPropagation();

  const th = this.parentElement;
  const cellIndex = th.cellIndex;
  const tbody = th.parentElement.parentElement.nextElementSibling;
  const theadRow = (thead => {
    for (let child of thead.children) {
      if (child.tagName === 'TR') return child;
    }
  })(th.parentElement.parentElement);

  th.parentElement.removeChild(th);

  for (const row of tbody.children) {
    row.removeChild(row.children[cellIndex]);
    if (!cellIndex && theadRow.children.length) {
      row.children[cellIndex].append(createDelStick('Delete row', deleteRow));
    }
  }

  if (!theadRow.children.length) {
    while (tbody.children.length) tbody.deleteRow(-1);
  }
}
