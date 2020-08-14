/**
 * Insert rule of dashboardInfo height equal to heights of maximum tables on dashboard page + dboHead.
 * Style is used when dashboard page is full, so height does not twitch when del/add dboItem from another page.
 * @param {object} data
 */
function addMaxTablesInDashboardPageHeight(data) {
  if (data.dashboardInfo.children.length > 1 && data.maxTablesInDashboardPage && !data.maxTablesInDashboardPageStyleAdded) {
    const dboItemHeight = querySel('.dbo-item').getBoundingClientRect().height;
    const dboHeadHeight = querySel('.dbo-head').getBoundingClientRect().height;

    for (const styleSheet of document.styleSheets) {
      if (styleSheet.href.includes('dashboard.css')) {
        const height = dboHeadHeight + (dboItemHeight * data.maxTablesInDashboardPage);

        styleSheet.insertRule(`#dashboardInfo.maxTablesInDashboardPageHeight { height: ${height}px }`, styleSheet.rules.length);
        data.maxTablesInDashboardPageStyleAdded = true;

        break;
      }
    }
  }
}

export default addMaxTablesInDashboardPageHeight;
