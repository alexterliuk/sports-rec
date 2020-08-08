/**
 * Make correct positions for .dbo-items.
 * @param {number} maxTablesInDashboardPage
 * @param {number} currentShownPage
 */
function updateDashboardIndexes(maxTablesInDashboardPage, currentShownPage) {
  const dashboardInfo = pickElem('dashboardInfo');
  if (!dashboardInfo) return;

  const dboCellNums = querySelAll('#dashboardInfo .dbo-cell-num');
  const maxTables = maxTablesInDashboardPage;
  const currPage = currentShownPage || 1;

  let pos = 1;
  for (const cellNum of dboCellNums) {
    cellNum.textContent = (currPage * maxTables) - maxTables + pos++;
  }
}

export default updateDashboardIndexes;
