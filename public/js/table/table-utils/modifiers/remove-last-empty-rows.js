/**
 * Remove empty rows if they are last in table.
 * @param {object} table
 */
function removeLastEmptyRows(table) {
  const isEmptyRow = row =>
    !row ? false : row.cells.every(cell => !cell.textareaValue.trim().length);

  while (isEmptyRow(table.tbodyRows[table.tbodyRows.length - 1])) {
    table.tbodyRows.pop();
  }
}
