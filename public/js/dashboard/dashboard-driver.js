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

    const navButtons = updateNavPageButtons('prevPage', 'nextPage');
    prevPage = navButtons[0];
    nextPage = navButtons[1];
    addNavPageButtonClickListeners(prevPage, nextPage);

    if (!dashboardInfo || !dashboardPages) return;

    _data.pages = pages;
    _data.tablesTotal = pages.tablesTotal;
    delete pages.tablesTotal;
    _data.maxTablesInDashboardPage = maxTablesInDashboardPage;
    _data.maxButtonsInRow = maxButtonsInRow;

    launched = true;
  };

  /**
   * Add click event listener to prevPage, nextPage.
   * @param {HTMLElement} elems
   */
  const addNavPageButtonClickListeners = (...elems) => {
    for (const elem of elems) {
      if (typeof elem === 'object' && elem instanceof HTMLElement) {
        // make sure this is nav button, add functionality of navigation between pageButtons
        if (['prevPage', 'nextPage'].includes(elem.id)) {
          elem.addEventListener('click', event => {
            const pageNum = +event.target.dataset.pageNum;

            if (_data.pages[pageNum]) {
              if (event.target.id === 'prevPage') {
                prevPage.dataset.pageNum = pageNum === 1 ? 0 : pageNum - 1;
                nextPage.dataset.pageNum = +nextPage.dataset.pageNum - 1;

              } else {
                nextPage.dataset.pageNum = pageNum + 1;
                prevPage.dataset.pageNum = +prevPage.dataset.pageNum + 1;
              }
            }
          });
        }
      }
    }
  };

  return { launch, isLaunched };
})();
