/**
 * Return id from stored collection, or make default one and return.
 * @param {array} storedCellsIds
 * @param {HTMLTableRowElement} row
 * @param {number} index
 * @param {string} hyphenId
 */
function getStoredCellIdOrMakeNew(storedCellsIds, row, index, hyphenId) {
  const cellsIds = Array.isArray(storedCellsIds) && storedCellsIds;
  const cellsIdsInRow = cellsIds && Array.isArray(cellsIds[row.rowIndex - 1]) && cellsIds[row.rowIndex - 1] || [];

  return cellsIdsInRow[index] || 'td' + createArbitraryString(6) + hyphenId;
}
