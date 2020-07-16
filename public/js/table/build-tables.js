/**
 * Trigger process of building tables.
 * @param {HTMLButtonElement} btn
 * @param {object} table
 * @param {array} tables
 * @param {function} getShownTablesInDashboard
 */
function buildTables(btn, { table, tables, getShownTablesInDashboard } = {}) {
  const _tables = table && [table]
               || tables
               || typeof getShownTablesInDashboard === 'function' && getShownTablesInDashboard() // Build All These Tables
               || [];

  for (const table of _tables) {
    createTableContainer(table);
  }
}
