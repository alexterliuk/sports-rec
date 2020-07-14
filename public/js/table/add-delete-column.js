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

  // do not create table with no text
  // (spec.eventType exists when you click Add column button, but not when table is initially being build)
  if (!spec.eventType && !(spec.columnsNames || []).length && !(spec.cellsTextValues || []).length) {
    return;
  }

  const _dom = dom || getBuildDOMLibrary();

  const tablePanel = pickElem(spec.tableId).parentElement;
  const hyphenId = pickElem(spec.tableId).dataset.hyphenId;
  const theadRow = querySel(`#${spec.tableId} thead tr`);
  const tbody = querySel(`#${spec.tableId} tbody`);
  const th = document.createElement('th');

  const currentColIndex = theadRow.children.length;
  const colIdSpec = Array.isArray(spec.columnsIds) && spec.columnsIds[currentColIndex];
  const colIdSpecWithHyphenIdEnding = typeof colIdSpec === 'string' && colIdSpec.slice(-4) === hyphenId && colIdSpec;
  const colId = colIdSpecWithHyphenIdEnding || 'th' + createArbitraryString(6) + hyphenId;

  th.setAttribute('id', colId);

  addTextareaAndHider(th);

  const currentTable = shownTables.get(hyphenId);

  Object.keys(spec).forEach(key => {
    const specItem = {};

    // when creating first column collect table building specification
    if (key !== 'columnsIds' && key !== 'eventType' && !currentTable[key]) {
      specItem[key] = spec[key];
    }

    // when adding each new column add new colId
    if (key === 'columnsIds') {
      specItem[key] = (currentTable.columnsIds || []).concat(colId);
    }

    if (specItem[key]) shownTables.addToTable(hyphenId, specItem, true);
  });

  th.append(createEditMask());
  th.append(createEditButton());
  th.append(createDelStick('Delete column', deleteColumn));

  if ((spec.onClick || currentTable.onClick || {}).funcName === 'sortColumn') {
    th.append(createSortingButton('Sort column', sortColumn));
  }

  _dom.hangOnElem(th, currentTable);
  theadRow.append(th);

  if (spec.columnsNames && Array.isArray(spec.columnsNames)) {
    querySel(`#${th.id} textarea`).value = spec.columnsNames[th.cellIndex] || '';
  }

  if (theadRow.children.length === 1) {
    const rowsQtySpec = Array.isArray(spec.cellsTextValues) && spec.cellsTextValues;
    const rowsQty = rowsQtySpec && rowsQtySpec.length || tablesConfig.getConfigItem('rowsQty');

    for (let i = 0; i < rowsQty; ++i) {
      addRow(null, spec, _dom);
    }

  } else { // [null].concat... - because at 0 index (row.rowIndex) is thead tr (see also addRow)
    const textValues = Array.isArray(spec.cellsTextValues) && spec.cellsTextValues && [null].concat(spec.cellsTextValues);

    for (const row of tbody.children) {
      const cellId = getStoredCellIdOrMakeNew(spec.cellsIds, row, row.children.length, hyphenId);
      const text = (textValues[row.rowIndex] || [])[row.children.length];

      const cell = createCell(row, cellId, text);

      if (spec.cellsClassNames) _dom.addClass(cell, spec.cellsClassNames[cell.id] || []);

      if (spec.cellsStyles) _dom.addStyle(cell, spec.cellsStyles[cell.id] || []);
      if (spec.cellsTextareaStyles) _dom.addStyle(querySel(`#${cell.id} textarea`), spec.cellsTextareaStyles[cell.id] || []);
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
