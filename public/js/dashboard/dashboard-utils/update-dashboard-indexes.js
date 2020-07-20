/**
 * Make correct positions for .dbo-items.
 */
function updateDashboardIndexes() {
  const dashboardInfo = pickElem('dashboardInfo');
  if (!dashboardInfo) return;

  let pos = dashboardInfo.children.length;
  while (--pos) {
    dashboardInfo.children[pos].children[0].textContent = pos;
  }
}
