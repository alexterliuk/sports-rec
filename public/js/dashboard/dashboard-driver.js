/**
 * Dashboard driver component. Responsible for creating, updating, deleting of data inside dashboard.
 * Dashboard consists of two main blocks - dashboardInfo, dashboardPages. Each is driven by corresponding update function.
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
   * Make correct positions for .dbo-items.
   */
  function updateDashboardIndexes() {
    const dashboardInfo = pickElem('dashboardInfo');
    if (!dashboardInfo) return;

    const dboCellNums = querySelAll('#dashboardInfo .dbo-cell-num');
    const maxTables = _data.maxTablesInDashboardPage;
    const currPage = _data.currentShownPage || 1;

    let pos = 1;
    for (const cellNum of dboCellNums) {
      cellNum.textContent = (currPage * maxTables) - maxTables + pos++;
    }
  }

  /**
   * Refresh dashboardPages due to adding/deleting of a page or navigating between page buttons.
   * @param {number} firstButtonNum
   * @param {object} newPage
   */
  const refreshPageButtons = ({ firstButtonNum, newPage } = {}) => {
    if (firstButtonNum) { // navigation buttons
      if (firstButtonNum < +dashboardPages.children[0].dataset.pageNum) { // prevPage clicked
        dashboardPages.children[dashboardPages.children.length - 1].remove();
        dashboardPages.prepend(_data.pages[firstButtonNum].pageButton);

      } else if (firstButtonNum > +dashboardPages.children[0].dataset.pageNum) { // nextPage clicked
        const lastPageNum = +dashboardPages.children[dashboardPages.children.length - 1].dataset.pageNum;
        dashboardPages.children[0].remove();
        dashboardPages.append(_data.pages[lastPageNum + 1].pageButton);
      }

    } else if (newPage && dashboardPages.children.length < _data.maxButtonsInRow) {
      dashboardPages.append(newPage.pageButton);

    } else { // last page might have been deleted
      let stop = 0;
      while (dashboardPages.children.length && !_data.pages[dashboardPages.children.length]) {
        dashboardPages.children[dashboardPages.children.length - 1].remove();
        if (++stop === 1000) break;
      }
    }
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

              refreshPageButtons({ firstButtonNum: +prevPage.dataset.pageNum + 1});
            }
          });
        }
      }
    }
  };

  return { launch, isLaunched };
})();
