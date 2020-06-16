/**
 * Add new column to table.
 * @param {HTMLButtonElement} btn
 * @param {object} spec
 * @param {object} dom - buildDOMLibrary
 */
function addColumn(btn, spec, dom) {
  console.log('addColumn spec:', spec);

  if (!spec.tableId) {
    console.error('Failed to add column, because no tableId provided.');
    return;
  }

  const tablePanel = pickElem(spec.tableId).parentElement;
  const hyphenId = pickElem(spec.tableId).dataset.hyphenId;
  const theadRow = querySel(`#${spec.tableId} thead tr`);
  const tbody = querySel(`#${spec.tableId} tbody`);
  const th = document.createElement('th');
  th.setAttribute('id', `col${theadRow.children.length}${hyphenId}`);
  addTextareaAndHider(th);

  const currentTable = tables.get(hyphenId);
  Object.keys(spec).forEach(key => {
    if (!currentTable.hasOwnProperty(key)) currentTable[key] = spec[key];
  });

  th.append(createEditMask());
  th.append(createDelStick('Delete column', deleteColumn));

  (dom || getBuildDOMLibrary()).hangOnElem(th, { onClick, onHover, newIds, textRow } = currentTable);
  theadRow.append(th);

  if (theadRow.children.length === 1) {
    for (let i = 0, { rowsQty } = tables.getAllConfig(); i < rowsQty; ++i) {
      addRow(null, { tableId } = spec, getBuildDOMLibrary());
    }
  } else {
    for (const row of tbody.children) {
      const cellId = `r${row.rowIndex}c${row.children.length}${hyphenId}`;
      createCell(row, cellId);
    }
  }

  toggleScrollMode(tablePanel);
}

/**
 * Delete column.
 */
function deleteColumn() {
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
