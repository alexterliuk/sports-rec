/**
 * Trigger process of building tables.
 * @param {HTMLButtonElement} btn
 * @param {array} tables
 * @param {function} getShownTablesInDashboard
 * @param {function} getTableFromDboItem
 */
function buildTables(btn, { tables, getShownTablesInDashboard, getTableFromDboItem } = {}) {
  const table = getTableFromDboItem(btn);

  const _tables = table && [table]
               || tables
               || typeof getShownTablesInDashboard === 'function' && getShownTablesInDashboard() // Build All These Tables
               || [];

  for (const table of _tables) {
    createTableContainer(table);
  }
}
