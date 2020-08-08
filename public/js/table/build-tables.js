import createTableContainer from './create-table-container.js';

/**
 * Trigger process of building tables.
 * @param {HTMLButtonElement} btn
 * @param {function} getTablesFromCurrentPage - Build All These Tables
 * @param {function} getTableFromDboItem
 */
function buildTables(btn, { getTablesFromCurrentPage, getTableFromDboItem } = {}) {
  const tables = typeof getTablesFromCurrentPage === 'function' && getTablesFromCurrentPage(btn);
  const table = typeof getTableFromDboItem === 'function' && getTableFromDboItem(btn);

  const _tables = tables || table && [table] || [];

  for (const table of _tables) {
    createTableContainer(null, table);
  }
}

export default buildTables;
