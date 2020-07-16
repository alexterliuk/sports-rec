/**
 * Collector of current user tables shown in dashboard.
 */
const shownTablesInDashboard = (function() {
  let _tables = [];

  /**
   * Add tables
   */
  const add = tables => {
    if (!Array.isArray(tables)) return;
    _tables = [];

    tables.forEach(table => {
      if (table.hyphenId) _tables.push(table);
    });
  };

  /**
   * Get tables
   */
  const get = () => _tables.map(table => createNewTableDataObject(table));

  /**
   * Update _tables to reflect current state of dashboardInfo
   */
  const update = () => {
    const dashboardInfo = pickElem('dashboardInfo');
    if (!dashboardInfo) return;

    if (dashboardInfo.children.length === 1 /* dashboard header */) {
      _tables = [];
      return;
    }

    let pos = 0;
    const dashboardHyphenIds = [];
    while (++pos < dashboardInfo.children.length) {
      dashboardHyphenIds.push(dashboardInfo.children[pos].dataset.hyphenId);
    }

    const deletedTables = _tables.filter((table, idx) => {
      if (!dashboardHyphenIds.includes(table.hyphenId)) {
        table.index = idx;
        return true;
      }
    });

    deletedTables.forEach(del => { _tables[del.index] = false; });
    _tables = _tables.filter(table => table);
  };

  return { add, get, update };
})();
