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

    if (_data.tablesTotal) {
      setActivePage(null, 1);
      addPageButtons(1);
    }

    launched = true;
  };

  /**
   * Show desired page.
   * @param {Event} event
   * @param {number} pageNum
   * @param {boolean} refresh
   */
  const setActivePage = (event, pageNum, refresh) => {
    if (event) pageNum = +event.target.dataset.pageNum;

    if (_data.pages[pageNum] && refresh || _data.pages[pageNum] && !_data.pages[pageNum].shown) {
      // remove current page
      let stop = 0;
      while (dashboardInfo.children.length !== 1) {
        dashboardInfo.children[dashboardInfo.children.length - 1].remove();
        if (++stop === 1000) break;
      }

      if (_data.pages[pageNum].dboItems.length === _data.maxTablesInDashboardPage) {
        dashboardInfo.classList.add('maxTablesInDashboardPageHeight');
      } else {
        dashboardInfo.classList.remove('maxTablesInDashboardPageHeight');
      }

      // add new page
      dashboardInfo.classList.add('spinner');
      setTimeout(() => { dashboardInfo.classList.remove('spinner') }, 100);
      _data.pages[pageNum].dboItems.forEach(item => {
        // can be used for visual effects:
        // let delay = 0;
        // setTimeout(() => visualizeWhileAppending(dashboardInfo, item), delay += 10);
        dashboardInfo.append(item);
      });

      if (_data.currentShownPage && _data.pages[_data.currentShownPage]) {
        _data.pages[_data.currentShownPage].shown = false;
        _data.pages[_data.currentShownPage].pageButton.classList.remove('active');
      }

      _data.pages[pageNum].shown = true;
      _data.pages[pageNum].pageButton.classList.add('active');
      _data.currentShownPage = pageNum;

      updateDashboardIndexes();
    }
  };

  /**
   * Make correct positions for .dbo-items.
   */
  const updateDashboardIndexes = () => {
    const dashboardInfo = pickElem('dashboardInfo');
    if (!dashboardInfo) return;

    const dboCellNums = querySelAll('#dashboardInfo .dbo-cell-num');
    const maxTables = _data.maxTablesInDashboardPage;
    const currPage = _data.currentShownPage || 1;

    let pos = 1;
    for (const cellNum of dboCellNums) {
      cellNum.textContent = (currPage * maxTables) - maxTables + pos++;
    }
  };

  /**
   * Add page buttons.
   * @param {number} firstButtonNum
   */
  const addPageButtons = (firstButtonNum/*, delay*/) => {
    if (!firstButtonNum || firstButtonNum < 0) firstButtonNum = 1;

    setTimeout(() => {
      dashboardPagination.classList.add('active');
    }, 250);

    setTimeout(() => {
      let lastPage = _data.pages[firstButtonNum + _data.maxButtonsInRow - 1];
      let stop = 0;
      while (!lastPage) {
        lastPage = _data.pages[--firstButtonNum + _data.maxButtonsInRow];
        if (++stop === 1000) break;
      }

      let stop2 = 0;
      const stopNum = lastPage.pageNum < _data.maxButtonsInRow ? 0 : lastPage.pageNum - _data.maxButtonsInRow;
      for (let i = lastPage.pageNum; i !== stopNum; i--) {
        dashboardPages.prepend(_data.pages[i].pageButton);
        if (++stop2 === 1000) break;
      }

      refreshNavPageButtons();
    }, /*delay || delay === 0 || */500);
  };

  /**
   * Remove page buttons and close dashboardPagination.
   */
  const removePageButtons = () => {
    if (dashboardPages.children[0]) {
      let stop = 0;
      while (dashboardPages.children.length) {
        dashboardPages.children[dashboardPages.children.length - 1].remove();
        if (++stop === 1000) break;
      }

      nextPage.dataset.pageNum = 0;
      prevPage.dataset.pageNum = 0;
      dashboardPagination.classList.remove('active');
    }
  };

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
   * Refresh navigational buttons to prev, next pages.
   */
  const refreshNavPageButtons = () => {
    if (!dashboardPages.children.length) return;

    const lastPageNumInRow = +dashboardPages.children[dashboardPages.children.length - 1].dataset.pageNum;
    nextPage.dataset.pageNum = lastPageNumInRow + 1;

    const firstPageNumInRow = +dashboardPages.children[0].dataset.pageNum;
    prevPage.dataset.pageNum = firstPageNumInRow - 1;
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

  return { launch, isLaunched, setActivePage };
})();
