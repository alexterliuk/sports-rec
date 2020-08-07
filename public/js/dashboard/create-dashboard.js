import { getAllTablesFromDashboardPage } from './dashboard-driver.js';
import makeDashboardPages from './make-dashboard-pages.js';

/**
 * Create page section which serves as user dashboard.
 * ?@param {number} tablesQty - how many tables to fetch
 * ?@param {number} maxTablesInDashboardPage
 * ?@param {number} maxButtonsInRow
 */
async function createDashboard({ tablesQty, maxTablesInDashboardPage, maxButtonsInRow } = {}) {
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
    { $parentName: 'buttons-block', tagName: 'button', newId: 'buildAllTheseTables', text: 'Build All These Tables',
      dataset: [{ key: 'pageNum', value: 0 }],
      onClick: { funcName: 'buildTables', funcArgs: [{ getTablesFromCurrentPage: getAllTablesFromDashboardPage }] },
    },
    { parentId: params.contId, tagName: 'div', class: ['panels-block'], $name: 'panels-block' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'left-panel'] },
    { $parentName: 'panels-block', tagName: 'section', class: ['dbo-panel'], $name: 'dbo-panel' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'right-panel'] },
    { $parentName: 'dbo-panel', tagName: 'div', newId: 'dashboardInfo' },
    { parentId: 'dashboardInfo', tagName: 'div', class: ['dbo-head'], $name: 'dbo-head' },
    { $parentName: 'dbo-head', tagName: 'div', class: ['dbo-cell'], text: '#' },
    { $parentName: 'dbo-head', tagName: 'div', class: ['dbo-cell', 'dbo-cell-title'], text: 'Title' },
    { $parentName: 'dbo-head', tagName: 'div', class: ['dbo-cell', 'dbo-cell-btn-cont'], text: 'Action' },
  ];

  buildDOM(params);
  makeDashboardPages({ tablesQty, maxTablesInDashboardPage, maxButtonsInRow });
}

export default createDashboard;
