/** Fetch tables and make pages - each with pageButton, dashboard rows (.dbo-items), 'Build All These Tables' button.
 * ?@param {number} tablesQty - how many tables to fetch
 * ?@param {number} maxTablesOnPage
 * ?@param {number} maxButtonsInRow
 */
async function makeDashboardPages({ tablesQty, maxTablesOnPage, maxButtonsInRow } = {}) {
  tablesQty = validatePositiveNumber(tablesQty);
  maxTablesOnPage = validatePositiveNumber(maxTablesOnPage, 10);
  maxButtonsInRow = validatePositiveNumber(maxButtonsInRow, 5);

  const tables = await getUserTables(null, { limit: tablesQty || 50 });
  // const getTables = () => JSON.parse(JSON.stringify(tables));

  shownTablesInDashboard.add(tables.slice(0, 10));
  savedTablesHyphenIds.add();

  dashboardDriver.launch({ pages: composePages(), maxTablesOnPage, maxButtonsInRow });

  function composePages() {
    if (!tables.length) return;

    const pgs = { pagesQty: 0, tablesTotal: 0 };

    let pageNum = 0;
    let sliceStart = 0;
    let currPageTables = tables.slice(sliceStart, sliceStart + maxTablesOnPage);

    let stop = 0;
    while (currPageTables.length) {
      pgs.pagesQty++;
      pgs[++pageNum] = addDashboardPageToPages(pgs, currPageTables, pageNum);

      sliceStart = pgs.pagesQty * maxTablesOnPage;
      currPageTables = tables.slice(sliceStart, sliceStart + maxTablesOnPage);
      pgs.tablesTotal += pgs[pageNum].dboItems.length;

      if (++stop === 1000) break;
    }

    return pgs;
  }
}
