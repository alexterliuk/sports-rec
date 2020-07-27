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



  /** ========== MAIN FUNCTION 1 ==========
   * Update dashboardInfo when saving, updating or deleting table.
   * Invoked by collectTableDataAndSave or confirmDeletingTable.
   * @param {object}
   */
  const updateDashboardInfo = ({ newTable, deletedTable, updatedTable }) => {
    addMaxTablesInDashboardPageHeight();

    if (newTable) {
      // first table
      if (!_data.tablesTotal) {
        updateDashboardPages({ pageNum: 1, added: { table: newTable } });
        visualizeWhileAppending(dashboardInfo, _data.pages[1].dboItems[0]);

      // not fully filled page
      } else if (_data.pages[_data.currentShownPage].dboItems.length < _data.maxTablesInDashboardPage) {

        const newDboItem = (tempNode => tempNode.removeChild(tempNode.children[0]))(createDashboardItems([newTable]));
        visualizeWhileAppending(dashboardInfo, newDboItem);

        setTimeout(() => { // wait for visualizeWhileAppending finish
          updateDashboardPages({
            pageNum: _data.currentShownPage,
            added: { table: newTable, node: newDboItem },
          });
        }, 300);

      // dashboardInfo is filled, update only dashboardPages
      } else {
        dashboardInfo.classList.add('maxTablesInDashboardPageHeight');

        const newDboItem = (tempNode => tempNode.removeChild(tempNode.children[0]))(createDashboardItems([newTable]));
        updateDashboardPages({
          added: { table: newTable, node: newDboItem },
        });
      }

    } else if (deletedTable) {
      // remove table from dashboardInfo
      const dashboardItem = (() => {
        let idx = dashboardInfo.children.length;
        while (idx) {
          const elem = dashboardInfo.children[--idx];
          if (elem.dataset.hyphenId === deletedTable.hyphenId) return elem;
        }
      })();

      // remove dboItem from dashboardInfo, and table from mainTableBlock
      visualizeThenRemove(dashboardInfo, dashboardItem, deletedTable.hyphenId, 3000);

      // if table of current page removed, then dashboardInfo lacks one dboItem to match maxTablesInDashboardPage criterion
      // if so and there's next page, fill the gap by taking dboItem from that page of dashboardPages
      setTimeout(() => {
        updateDashboardPages({ // reflow dashboardPages to reflect current state of data and patch any gaps
          deleted: { table: deletedTable },
        });

        if (dashboardInfo.children.length > 1 /*first child is .dbo-head*/) {
          const currPage = _data.pages[_data.currentShownPage];

          // take last dboItem added to currPage by updateDashboardPages and add it to dashboardInfo
          visualizeWhileAppending(dashboardInfo, currPage.dboItems[dashboardInfo.children.length - 1]);

          setTimeout(() => {
            if (dashboardInfo.children.length !== _data.maxTablesInDashboardPage + 1 /*.dbo-head*/) {
              dashboardInfo.classList.remove('maxTablesInDashboardPageHeight');
            }
          }, 100);
        }
      }, 3500);

    } else if (updatedTable) {
      const tableAddress = getAddressOfFetchedEarlierTable(updatedTable.hyphenId);

      _data.pages[tableAddress.pageNum].tables[tableAddress.tableIndex] = updatedTable;
      _data.pages[tableAddress.pageNum].dboItems[tableAddress.tableIndex].children[1].textContent = updatedTable.tableTitle;
    }
  };



  /** ========== MAIN FUNCTION 2 ==========
   * Update dashboardPages, store data fetched from server in _data.pages.
   * _data is declared in the beginning of dashboardDriver and holds tables and info for dashboard.
   * When table is modified and saved on server, updateDashboardPages is invoked via updateDashboardInfo.
   * Then changes are saved in _data.
   * @param {object}
   */
  const updateDashboardPages = ({ pageNum, added, deleted, updated } = {}) => {
    if (dashboardInfo.children.length === 1 /*only .dbo-head*/) {
      if (added) { // first table created, make page with table and dboItem for _data.pages
        // it can be only 1st page and not empty another one, bec. pages with no data are deleted automatically
        addDashboardPageToPages(_data.pages, 1, [added.table]);

        if (!dashboardPages.children.length) {
          _data.pages[1].pageButton.classList.add('active');
          addPageButtons(1);
        }

        _data.tablesTotal = 1;
        _data.currentShownPage = 1;
        _data.pages.pagesQty = 1;
      }

      if (deleted) { // last table deleted, remove page from _data.pages
        // make sure deleted table and left one in _data.pages' page match
        if (_data.pages[_data.currentShownPage] && _data.pages[_data.currentShownPage].tables[0].hyphenId === deleted.table.hyphenId) {
          if (_data.currentShownPage === 1) {
            removePageButtons();
            delete _data.pages[1];
            delete _data.tablesTotal;
            delete _data.currentShownPage;
            delete _data.pages.pagesQty;

          } else {
            delete _data.pages[_data.currentShownPage];
            _data.tablesTotal--;
            _data.pages.pagesQty--;
            refreshPageButtons();
            setActivePage(null, --_data.currentShownPage);
          }
        }
      }

      if (updated) {

      }

    } else {

      if (!_data.currentShownPage) return;

      let currPage = _data.pages[_data.currentShownPage];
      let lastPage = _data.pages[_data.pages.pagesQty];

      const { hyphenIdsOnPage, hyphenIdsInData } = getHyphenIdsFromCurrentPage(currPage);

      if (added) {
        const addedTableIndex = hyphenIdsOnPage.findIndex(id => !hyphenIdsInData.includes(id));
        const addedTableHyphenId = hyphenIdsOnPage[addedTableIndex];

        const tableAddress = addedTableHyphenId && getAddressOfFetchedEarlierTable(addedTableHyphenId);
        if (tableAddress) { // table from other page has been added to current shown page
          const dboItem = _data.pages[tableAddress.pageNum].dboItems[tableAddress.tableIndex];

          _data.pages[pageNum || 1].dboItems.splice(addedTableIndex, 0, dboItem);

        } else { // it is new table has just been saved

          if (currPage.dboItems.length < _data.maxTablesInDashboardPage) {
            currPage.dboItems.splice(addedTableIndex, 0, added.node);
            currPage.tables.splice(addedTableIndex, 0, added.table);

          } else if (lastPage && lastPage.dboItems.length < _data.maxTablesInDashboardPage) { // current page is completely filled
            lastPage.dboItems.push(added.node);
            lastPage.tables.push(added.table);

          } else { // no lastPage or its dboItems and tables are filled, create new page
            addDashboardPageToPages(_data.pages, _data.pages.pagesQty + 1, [added.table]);
            _data.pages.pagesQty++;
          }

          _data.tablesTotal++;
          refreshPageButtons({ newPage: _data.pages[_data.pages.pagesQty] });
        }
      }

      if (deleted) {
        const removedDboItemIndex = hyphenIdsInData.findIndex(id => !hyphenIdsOnPage.includes(id));

        if (~removedDboItemIndex) { // look for deleted table on current shown page
          currPage.dboItems.splice(removedDboItemIndex, 1);
          currPage.tables.splice(removedDboItemIndex, 1);

          reflowTablesAndDboItems({ currPage, deleted: true });

        } else { // if deleted table not found, search it over all fetched tables (in _data.pages)
          const tableAddress = getAddressOfFetchedEarlierTable(deleted.table.hyphenId);
          if (tableAddress) {
            _data.pages[tableAddress.pageNum].dboItems.splice(tableAddress.tableIndex, 1);
            _data.pages[tableAddress.pageNum].tables.splice(tableAddress.tableIndex, 1);

            reflowTablesAndDboItems({ currPage: _data.pages[tableAddress.pageNum], deleted: true });
          }
        }

        // remove empty page from _data.pages (it might form after reflowTablesAndDboItems job - table might have been flown to previous page)
        if (!_data.pages[_data.pages.pagesQty].dboItems.length && !_data.pages[_data.pages.pagesQty].tables.length) {
          delete _data.pages[_data.pages.pagesQty];
          _data.pages.pagesQty--;

          // if it is the page currently shown in dashboardInfo, redirect to previous one
          if (_data.currentShownPage === _data.pages.pagesQty + 1) setActivePage(null, _data.pages.pagesQty);
          refreshPageButtons();
        }

        // dboItem from shown page might have flown to another page to fill the gap there after deletion, refresh page
        setActivePage(null, _data.currentShownPage, true);
      }

      if (updated) {

      }
    }
  };



  /**
   * Insert rule of dashboardInfo height equal to heights of maximum tables on dashboard page + dboHead.
   * Style is used when dashboard page is full, so height does not twitch when del/add dboItem from another page.
   */
  const addMaxTablesInDashboardPageHeight = () => {
    if (dashboardInfo.children.length > 1 && _data.maxTablesInDashboardPage && !_data.maxTablesInDashboardPageStyleAdded) {
      const dboItemHeight = querySel('.dbo-item').getBoundingClientRect().height;
      const dboHeadHeight = querySel('.dbo-head').getBoundingClientRect().height;

      for (const styleSheet of document.styleSheets) {
        if (styleSheet.href.includes('dashboard.css')) {
          const height = dboHeadHeight + (dboItemHeight * _data.maxTablesInDashboardPage);

          styleSheet.insertRule(`#dashboardInfo.maxTablesInDashboardPageHeight { height: ${height}px }`, styleSheet.rules.length);
          _data.maxTablesInDashboardPageStyleAdded = true;

          break;
        }
      }
    }
  };

  /**
   * Look if dashboard page has less tables than maxTablesInDashboardPage, if needed add missing table and dboItem taking it from next page.
   * Do the same for all pages starting from currPage except last.
   * @param {object} currPage
   * @param {boolean} deleted
   * @param {boolean} added
   */
  const reflowTablesAndDboItems = ({ currPage, deleted, added } = {}) => {
    if (!currPage) return;

    let nextPageNum = currPage.pageNum + 1;
    let nextPage = _data.pages[nextPageNum];

    let stop = 0;
    while (nextPage) {
      if (deleted && currPage.dboItems.length < _data.maxTablesInDashboardPage) {

        const nextPageFirstDboItem = nextPage.dboItems.shift();
        const nextPageFirstTable = nextPage.tables.shift();

        if (nextPageFirstDboItem && nextPageFirstTable) {
          currPage.dboItems.push(nextPageFirstDboItem);
          currPage.tables.push(nextPageFirstTable);
        }
      }

      // if (added) {
      //   const currPageLastDboItem = currPage.dboItems.pop();
      //   const currPageLastTable = currPage.tables.pop();
      //
      //   if (currPageLastDboItem) {
      //     nextPage.dboItems.unshift(currPageLastDboItem);
      //     nextPage.tables.unshift(currPageLastTable);
      //   }
      // }

      currPage = nextPage;
      nextPage = _data.pages[++nextPageNum];

      if (++stop === 1000) break;
    }
  };

  /** Collect hyphenIds from all tables in dashboardInfo and in _data.pages' page.
   * @param {object} currPage - page of _data.pages
   */
  const getHyphenIdsFromCurrentPage = currPage => {
    const hyphenIdsOnPage = [];
    const hyphenIdsInData = [];

    for (const entity of [[dashboardInfo.children, hyphenIdsOnPage], [currPage.dboItems, hyphenIdsInData]]) {
      const data = entity[0];
      const arr = entity[1];

      for (const child of data) {
        if (child.classList.value.includes('dbo-item')) {
          arr.push(child.dataset.hyphenId);
        }
      }
    }

    return { hyphenIdsOnPage, hyphenIdsInData };
  };

  /**
   * Find a table in all tables in _data.pages, return its address in _data.pages.
   * @param {string} hyphenId
   */
  const getAddressOfFetchedEarlierTable = hyphenId => {
    let found;

    for (let i = 1; i <= _data.pages.pagesQty; i++) {
      _data.pages[i].dboItems.some((item, idx) => {

        if (item.dataset.hyphenId === hyphenId) {
          found = { pageNum: i, tableIndex: idx };

          return true;
        }
      });

      if (found) return found;
    }
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
   * Get table from _data.pages.
   * @param {string} hyphenId
   */
  function getTableFromDashboardPage(hyphenId) {
    if (typeof hyphenId === 'string') {
      const tableAddress = getAddressOfFetchedEarlierTable(hyphenId);

      if (tableAddress) {
        return _data.pages[tableAddress.pageNum].tables[tableAddress.tableIndex];
      }
    }
  }

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

  return { launch, isLaunched, setActivePage, getTableFromDashboardPage, updateDashboardInfo };
})();
