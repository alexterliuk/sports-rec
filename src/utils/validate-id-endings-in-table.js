/**
 * Search ids and make their endings be equal to hyphenId, if they are not.
 * Throw error if non unique id is found.
 * @param {object} preSavedTable
 */
function validateIdEndingsInTable(preSavedTable) {
  const hyphenId = preSavedTable.hyphenId;
  const collectedIds = [];

  for (const col of preSavedTable.theadRow) {
    if (!isUniqueId(col)) {
      return {
        columnId: col.id,
        columnIndex: preSavedTable.theadRow.findIndex(el => el === col) + 1,
        uniqueId: false,
      };
    }
  }

  for (const row of preSavedTable.tbodyRows) {
    const rowIndex = preSavedTable.tbodyRows.findIndex(el => el === row) + 1;

    if (!isUniqueId(row)) {
      return {
        rowId: row.id,
        rowIndex,
        uniqueId: false,
      }
    }

    for (const cell of row.cells) {
      if (!isUniqueId(cell)) {
        return {
          rowIndex,
          cellId: cell.id,
          cellIndex: row.cells.findIndex(el => el === cell) + 1,
          uniqueId: false,
        };
      }
    }
  }

  return {
    uniqueId: true,
  };

  // Validate id uniqueness, make sure id has proper hyphenId ending
  function isUniqueId(item) {
    if (item.id) {
      const id = makeEnding(item.id, hyphenId);

      if (collectedIds.length && collectedIds.includes(id)) return false;

      collectedIds.push(id);
      item.id = id;
    }

    return true;
  }

  // Make proper hyphenId ending if needed
  function makeEnding(id, hyphenId) {
    return id.slice(-4) === hyphenId ? id : `${id}${hyphenId}`;
  }
}

module.exports = validateIdEndingsInTable;
