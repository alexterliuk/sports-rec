import { launch } from './dashboard-driver.js';
import { addDashboardPageToPages } from './dashboard-utils/dashboard-pages-utils.js';
import validatePositiveNumber from '../utils/validate-positive-number.js';
import { savedTablesHyphenIds } from '../table/state-collectors/index.js';

/** Fetch tables and make pages - each with pageButton, dashboard rows (.dbo-items), 'Build All These Tables' button.
 * ?@param {number} tablesQty - how many tables to fetch
 * ?@param {number} skip - how many tables to skip
 * ?@param {number} maxTablesInDashboardPage
 * ?@param {number} maxButtonsInRow
 */
async function makeDashboardPages({ tablesQty, skip, maxTablesInDashboardPage, maxButtonsInRow } = {}) {
  tablesQty = validatePositiveNumber(tablesQty);
  skip = validatePositiveNumber(skip, 0);
  maxTablesInDashboardPage = validatePositiveNumber(maxTablesInDashboardPage, 10);
  maxButtonsInRow = validatePositiveNumber(maxButtonsInRow, 5);

  const tables = await getUserTables(null, { limit: tablesQty || 50, skip });
  // const getTables = () => JSON.parse(JSON.stringify(tables));

  savedTablesHyphenIds.add();

  launch({ pages: composePages(), maxTablesInDashboardPage, maxButtonsInRow });

  function composePages() {
    const pgs = { pagesQty: 0, tablesTotal: 0 };

    let pageNum = 0;
    let sliceStart = 0;
    let currPageTables = tables.slice(sliceStart, sliceStart + maxTablesInDashboardPage);

    let stop = 0;
    while (currPageTables.length) {
      pgs.pagesQty++;
      pgs[++pageNum] = addDashboardPageToPages(pgs, pageNum, currPageTables);

      sliceStart = pgs.pagesQty * maxTablesInDashboardPage;
      currPageTables = tables.slice(sliceStart, sliceStart + maxTablesInDashboardPage);
      pgs.tablesTotal += pgs[pageNum].dboItems.length;

      if (++stop === 1000) break;
    }

    return pgs;
  }
}

export default makeDashboardPages;
