/**
 * Create page section which serves as user dashboard.
 * Fetch tables, show their titles and buttons 'Build table'.
 * On top of dashboard put button 'Build All These Tables'.
 * @param {number} tablesQty - how many tables to fetch
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
    shownTablesInDashboard.add(tables);
    savedTablesHyphenIds.add();

    const parentSelector = '#dashboardBlock .buttons-block';

    const params = {
      parentSelector,
      elems: [{
        parentSelector, tagName: 'button', text: 'Build All These Tables', newId: 'buildAllTheseTables',
        onClick: { funcName: 'buildTables', funcArgs: [{ getShownTablesInDashboard: shownTablesInDashboard.get }] },
      }],
    };

    buildDOM(params);
    createDashboardItems(tables);
  }
}
