/**
 * Collector of current user tables shown on page (both saved and new not yet saved).
 * Each table represents data used to create table and its contents.
 * Each table is accessible by hyphenId (id ending which is unique for each table).
 */
const shownTables = (function() {
  const _tables = {};

  /**
   * Add new table
   */
  const add = (hyphenId, buildingDOMLibraryAndTable) => {
    if (!_tables.hasOwnProperty(hyphenId) && typeof (buildingDOMLibraryAndTable || {}).root === 'object') {
      _tables[hyphenId] = buildingDOMLibraryAndTable.root;
    }
  };

  /**
   * Add (or update) specification to table
   */
  const addToTable = (hyphenId, spec, override) => {
    const table = _tables[hyphenId];
    const specName = Object.keys(spec)[0];

    if (table && specName) {
      if (override) {
        table[specName] = spec[specName];
      } else if (!table.hasOwnProperty(specName)) {
        table[specName] = spec[specName];
      }
    }

    _tables[hyphenId] = createNewTableDataObject(_tables[hyphenId]);
  };

  /**
   * Get specifications of a table
   */
  const get = hyphenId => createNewTableDataObject(_tables[hyphenId]);

  /**
   * Get specifications of all tables
   */
  const getAll = () => {
    const copiedTables = {};

    Object.keys(_tables).forEach(hyphenId => {
      copiedTables[hyphenId] = createNewTableDataObject(_tables[hyphenId]);
    });

    return copiedTables;
  };

  /**
   * Remove table from page
   */
  const remove = hyphenId => {
    const table = _tables[hyphenId];

    if (table) {
      const shownTable = pickElem(`${table.elementId.slice(0, -5)}`);
      if (shownTable) shownTable.remove();

      delete _tables[hyphenId];
    }
  };

  /**
   * Remove all tables from page
   */
  const removeAll = () => {
    const hyphenIds = Object.keys(_tables);
    for (const id of hyphenIds) remove(id);
  };

  return { add, addToTable, get, getAll, remove, removeAll };
})();
