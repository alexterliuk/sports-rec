/**
 * Collect textareas values of each column in table.
 * @param {string} tableId
 * @param {HTMLElement} [tbody]
 * @param {HTMLElement} [theadRow]
 */
function collectCellsVals(tableId, tbody, theadRow) {
  tbody = tbody || querySel(`#${tableId} tbody`);
  theadRow = theadRow || querySel(`#${tableId} thead tr`);

  const columnsIds = Array.prototype.map.call(theadRow.children, child => child.id);
  const columnsData = columnsIds.map(id => ({ id, vals: [] }));

  for (const row of tbody.childNodes) {
    for (const cell of row.cells) {
      const textarea = querySel(`#${cell.id} textarea`);
      columnsData[cell.cellIndex].vals.push(textarea.value);
    }
  }

  return columnsData;
}

export default collectCellsVals;
