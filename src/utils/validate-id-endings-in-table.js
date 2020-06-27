/**
 * Search ids and make their endings be equal to hyphenId, if they are not.
 * Throw error if non unique id is found.
 * @param {object} preSavedTable
 */
function validateIdEndingsInTable(preSavedTable) {
  const hyphenId = preSavedTable.hyphenId;
  const collectedIds = [];

  for (const col of preSavedTable.theadRow) {
    if (!isUniqueId(col)) return false;
  }

  for (const row of preSavedTable.tbodyRows) {
    if (!isUniqueId(row)) return false;

    for (const cell of row.cells) {
      if (!isUniqueId(cell)) return false;
    }
  }

  return true;

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
