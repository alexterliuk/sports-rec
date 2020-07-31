/**
 * Search and remove columns with no text.
 * @param {object} table
 */
function removeEmptyColumns(table) {
  const columnsWithoutText = [];
  table.theadRow.forEach((column, idx) => {
    if (!column.textareaValue.trim().length) {
      const columnCellsTexts = table.tbodyRows.map(row => row.cells[idx].textareaValue);
      const noTextInColumn = columnCellsTexts.every(text => !text.trim().length);

      if (noTextInColumn) columnsWithoutText.push({ colIndex: idx });
    }
  });

  for (const emptyColumn of columnsWithoutText) {
    table.theadRow[emptyColumn.colIndex] = false;
    table.tbodyRows.forEach(row => {
      row.cells[emptyColumn.colIndex] = false;
    });
  }

  table.theadRow = table.theadRow.filter(column => column);
  table.tbodyRows.forEach(row => {
    row.cells = row.cells.filter(cell => cell);
  });
}
