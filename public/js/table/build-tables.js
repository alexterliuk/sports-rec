/**
 * Trigger process of building tables.
 * @param {HTMLButtonElement} btn
 * @param {object} table
 * @param {array} tables
 */
function buildTables(btn, { table, tables } = {}) {
  const _tables = table && [table] || tables || [];

  for (const table of _tables) {
    createTableContainer(table);
  }
}
