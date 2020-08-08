/**
 * Close whole table container including title and buttons-block.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
function closeTable(btn, { tableId }) {
  const table = pickElem(tableId);

  if (table) {
    shownTables.remove(table.dataset.hyphenId);
  }
}

export default closeTable;
