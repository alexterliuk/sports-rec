/**
 * Dashboard driver component. Responsible for creating, updating, deleting of data inside dashboard.
 * Dashboard consists of two main blocks - dashboardInfo, dashboardPage. Each is driven by corresponding update function.
 * Component is initialized by dashboardDriver.launch.
 */
const dashboardDriver = (function() {
  let launched = false;
  let dashboardInfo, dashboardPagination, dashboardPages, prevPage, nextPage;
  const _data = {};

  const isLaunched = () => launched;

  /**
   * @param pages
   * @param maxTablesInDashboardPage
   * @param maxButtonsInRow
   */
  const launch = ({ pages, maxTablesInDashboardPage, maxButtonsInRow } = {}) => {
    dashboardInfo = pickElem('dashboardInfo');
    createDashboardPagination();
    dashboardPagination = pickElem('dashboardPagination');
    dashboardPages = pickElem('dashboardPages');

    if (!dashboardInfo || !dashboardPages) return;

    _data.pages = pages;
    _data.tablesTotal = pages.tablesTotal;
    delete pages.tablesTotal;
    _data.maxTablesInDashboardPage = maxTablesInDashboardPage;
    _data.maxButtonsInRow = maxButtonsInRow;

    launched = true;
  };

  return { launch, isLaunched };
})();
