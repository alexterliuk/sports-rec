/**
 * Look if dashboard page has less tables than maxTablesInDashboardPage, if needed add missing table and dboItem taking it from next page.
 * Do the same for all pages starting from currPage except last.
 * added is used only when normal workflow of dashboardDriver is broken (see _mobs.dashboardInfoLength).
 * @param {object} ctx
 * @param {object} currPage
 * @param {boolean} deleted
 * @param {boolean} added
 */
function reflowTablesAndDboItems(ctx, { currPage, deleted, added } = {}) {
  if (!currPage) return;

  const dataPages = ctx._data.pages;
  const maxTablesInDashboardPage = ctx._data.maxTablesInDashboardPage;
  let nextPageNum = currPage.pageNum + 1;
  let nextPage = dataPages[nextPageNum];

  let stop = 0;
  while (nextPage) {
    if (deleted && currPage.dboItems.length < maxTablesInDashboardPage) {

      const nextPageFirstDboItem = nextPage.dboItems.shift();
      const nextPageFirstTable = nextPage.tables.shift();

      if (nextPageFirstDboItem && nextPageFirstTable) {
        currPage.dboItems.push(nextPageFirstDboItem);
        currPage.tables.push(nextPageFirstTable);
      }
    }

    if (added) {
      const currPageLastDboItem = currPage.dboItems.pop();
      const currPageLastTable = currPage.tables.pop();

      if (currPageLastDboItem) {
        nextPage.dboItems.unshift(currPageLastDboItem);
        nextPage.tables.unshift(currPageLastTable);
      }
    }

    currPage = nextPage;
    nextPage = dataPages[++nextPageNum];

    if (++stop === 1000) break;
  }
}

export default reflowTablesAndDboItems;
