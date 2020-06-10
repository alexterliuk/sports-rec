/**
 * Add new column to table.
 * @param {string} id
 */
function addColumn(id) {
  const tablePanel = pickElem(id).parentElement;
  const hyphenId = pickElem(id).dataset.hyphenId;
  const theadRow = querySel(`#${id} thead tr`);
  const tbody = querySel(`#${id} tbody`);

  const th = document.createElement('th');
  th.append(createDelStick('Delete column', deleteColumn));
  theadRow.append(th);

  for (const row of tbody.children) {
    const cellId = `r${row.rowIndex}c${row.children.length}${hyphenId}`;
    createCell(row, cellId);
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

  th.parentElement.removeChild(th);

  for (const row of tbody.children) {
    row.removeChild(row.children[cellIndex]);
  }
}
