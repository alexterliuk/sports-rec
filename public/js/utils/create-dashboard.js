/**
 * Create page section which serves as user dashboard.
 * Fetch 10 tables, show their titles and buttons 'Build table'.
 * On top of dashboard put button 'Build All Shown Tables'.
 * @param {number} tablesQty
 * @param {number} skip
 */
async function createDashboard({ tablesQty, skip } = {}) {
  const contId = 'dashboardBlock';
  if (pickElem(contId)) return;

  const params = {
    parentSelector: 'main',
    contId,
    class: ['dbo'],
    firstChild: true,
  };

  params.elems = [
    { parentId: params.contId, tagName: 'div', class: ['buttons-block'], $name: 'buttons-block' },
    { parentId: params.contId, tagName: 'div', class: ['panels-block'], $name: 'panels-block' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'left-panel'] },
    { $parentName: 'panels-block', tagName: 'section', class: ['dbo-panel'], $name: 'dbo-panel' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'right-panel'] },
    { $parentName: 'dbo-panel', tagName: 'div', newId: 'dashboardInfo' },
    { parentId: 'dashboardInfo', tagName: 'div', class: ['dbo-head'], $name: 'dbo-head' },
    { $parentName: 'dbo-head', tagName: 'div', class: ['dbo-cell', 'dbo-cell-num'], text: '#' },
    { $parentName: 'dbo-head', tagName: 'div', class: ['dbo-cell', 'dbo-cell-title'], text: 'Title' },
    { $parentName: 'dbo-head', tagName: 'div', class: ['dbo-cell', 'dbo-cell-btn-cont'], text: 'Action' },
  ];

  buildDOM(params);

  const tables = await getUserTables(null, { limit: tablesQty });
  if (tables.length) {
    const parentSelector = '#dashboardBlock .buttons-block';

    const params = {
      parentSelector,
      elems: [{
        parentSelector, tagName: 'button', text: 'Build All Shown Tables',
        onClick: { funcName: 'buildTables', funcArgs: [{ tables }] },
      }],
    };

    buildDOM(params);
    createDashboardItems(tables);
  }
}

/**
 * Create a row with position, table title and button 'Build table'.
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

    return [
      { parentId: 'dashboardInfo', tagName, class: ['dbo-item'], $name },
      { $parentName, tagName, class: ['dbo-cell', 'dbo-cell-num'], text: pos },
      { $parentName, tagName, class: ['dbo-cell', 'dbo-cell-title'], text: table.tableTitle },
      { $parentName, tagName, class: ['dbo-cell', 'dbo-cell-btn-cont'], $name: btnContName },
      { $parentName: btnContName, tagName: 'button', class: ['dbo-btn-build-table'], text: 'Build table',
        onClick: { funcName: 'buildTables', funcArgs: [{ table }] },
      },
    ];
  }
}
