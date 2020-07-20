/**
 * Create a row with position, table title and button 'Build table'. Add it to dashboardInfo.
 * @param {array} tables
 */
function createDashboardItems(tables) {
  const params = {
    parentId: 'dashboardInfo',
    elems: [],
  };

  tables.forEach((table, idx) => {
    params.elems = params.elems.concat(getDashboardItemSpec(idx + 1, table));
  });

  buildDOM(params);

  /**
   * Create dashboard item's specification to be used for building elements in buildDOM.
   * @param {number} pos
   * @param {object} table
   */
  function getDashboardItemSpec(pos, table) {
    const $name = `dbo-item${pos}`;
    const $parentName = $name;
    const tagName = 'div';
    const btnContName = `dbo-cell-btn-cont${pos}`;
    const datasetHyphenId = { key: 'hyphenId', value: table.hyphenId };

    return [
      { parentId: 'dashboardInfo', tagName, class: ['dbo-item'], dataset: [datasetHyphenId], $name },
      { $parentName, tagName, class: ['dbo-cell', 'dbo-cell-num'], text: pos },
      { $parentName, tagName, class: ['dbo-cell', 'dbo-cell-title'], text: table.tableTitle },
      { $parentName, tagName, class: ['dbo-cell', 'dbo-cell-btn-cont'], $name: btnContName },
      { $parentName: btnContName, tagName: 'button', class: ['dbo-btn-build-table'], text: 'Build table',
        onClick: { funcName: 'buildTables', funcArgs: [{ table }] },
      },
    ];
  }
}
