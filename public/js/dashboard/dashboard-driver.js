import createDashboardItems from './create-dashboard-items.js';
import createDashboardPagination from './create-dashboard-pagination.js';
import updateDashboardIndexes from './dashboard-utils/update-dashboard-indexes.js';
import { addDashboardPageToPages } from './dashboard-utils/dashboard-pages-utils.js';
import { updateNavPageButtons } from './dashboard-utils/dashboard-page-buttons-creating-utils.js';
import setActivePage from './dashboard-utils/set-active-page.js';
import { visualizeWhileAppending, visualizeThenRemove } from './dashboard-utils/visualize.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';
import watch from '../utils/watch.js';
import { getUserTables } from '../services/index.js';

import * as dashboardPageButtonsUtils from './dashboard-utils/dashboard-page-buttons-utils.js';
import * as dashboardPageTablesUtils from './dashboard-utils/dashboard-page-tables-utils.js';
import addMaxTablesInDashboardPageHeight from './dashboard-utils/add-max-tables-in-dashboard-page-height.js';
import * as getHIdsFromCurrPage from './dashboard-utils/get-hyphen-ids-from-current-page.js';
import reflowTablesAndDboItems from './dashboard-utils/reflow-tables-and-dbo-items.js';

/**
 * Dashboard driver component. Responsible for creating, updating, deleting of data inside dashboard.
 * Dashboard consists of two main blocks - dashboardInfo, dashboardPages. Each is driven by corresponding update function.
 * Component is initialized by dashboardDriver.launch.
 */
const dashboardDriver = (function() {
  const _data = {};

  let launched = false;
  const isLaunched = () => launched;

  let buildAllTheseTables, dashboardInfo, dashboardPagination, dashboardPages, prevPage, nextPage;
  let ctx;

  // get dashboard context
  const getContext = () => ctx;

  // bind getContext to imported modules which require updated context when invoked
  const boundCtxGetter = ((...objs) => {
    const bundle = {};

    objs.forEach(obj => {
      Object.keys(obj).forEach(key => {
        bundle[key] = obj[key].bind({ getContext });
      });
    });

    return bundle;
  })({
      ...dashboardPageButtonsUtils,
      ...dashboardPageTablesUtils,
      ...getHIdsFromCurrPage,
    });



  /**
   * @param pages
   * @param maxTablesInDashboardPage
   * @param maxButtonsInRow
   */
  const launch = ({ pages, maxTablesInDashboardPage, maxButtonsInRow } = {}) => {
    buildAllTheseTables = pickElem('buildAllTheseTables');
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

    ctx = {
      _data,
      buildAllTheseTables,
      dashboardInfo,
      dashboardPagination,
      dashboardPages,
      prevPage,
      nextPage,
    };

    if (_data.tablesTotal) {
      setActivePage(null, 1, undefined, ctx);
      addPageButtons(1);
    }

    launched = true;
    watchDashboardInfoChanges();
  };

  /**
   * Trigger mutation observer watching changes in dashboardInfo.
   */
  const watchDashboardInfoChanges = () => {
    watch('dashboardInfoLength', dashboardInfo, { getContext, isDashboardInfoUpdating, getHyphenIdsFromCurrentPage, repackDashboardPages });
  };



  /** ========== MAIN FUNCTION 1 ==========
   * Update dashboardInfo when saving, updating or deleting table.
   * Invoked by collectTableDataAndSave or confirmDeletingTable.
   * @param {object}
   */
  const updateDashboardInfo = ({ newTable, deletedTable, updatedTable }) => {
    _data.dashboardInfoIsUpdating = true;
    addMaxTablesInDashboardPageHeight(getContext());

    if (newTable) {
      // first table
      if (!_data.tablesTotal) {
        updateDashboardPages({ pageNum: 1, added: { table: newTable } });
        visualizeWhileAppending(dashboardInfo, _data.pages[1].dboItems[0]);

      // not fully filled page
      } else if (_data.pages[_data.currentShownPage].dboItems.length < _data.maxTablesInDashboardPage) {

        const newDboItem = (tempNode => tempNode.removeChild(tempNode.children[0]))(createDashboardItems([newTable]));
        visualizeWhileAppending(dashboardInfo, newDboItem);
        setTimeout(() => {
          updateDashboardIndexes(ctx._data.maxTablesInDashboardPage, ctx._data.currentShownPage);
        }, 100);

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
      // find dboItem which should be removed from dashboardInfo
      const dashboardItem = (() => {
        let idx = dashboardInfo.children.length;
        while (idx) {
          const elem = dashboardInfo.children[--idx];
          if (elem.dataset.hyphenId === deletedTable.hyphenId) return elem;
        }
      })();

      const duration = getDefaultTimeoutDuration();

      // remove dboItem from dashboardInfo, and table from mainTableBlock
      visualizeThenRemove(dashboardInfo, dashboardItem, deletedTable.hyphenId, duration);

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
      }, duration + 500);

    } else if (updatedTable) {
      const tableAddress = boundCtxGetter.getAddressOfFetchedEarlierTable(updatedTable.hyphenId, _data.pages);

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

        buildAllTheseTables.dataset.pageNum = 1;
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

            buildAllTheseTables.dataset.pageNum = 0;

          } else {
            delete _data.pages[_data.currentShownPage];
            _data.tablesTotal--;
            _data.pages.pagesQty--;
            refreshPageButtons();
            setActivePage(null, --ctx._data.currentShownPage, undefined, ctx);
          }
        }
      }

      if (updated) {

      }

    } else {

      if (!_data.currentShownPage) return;

      let currPage = _data.pages[_data.currentShownPage];
      let lastPage = _data.pages[_data.pages.pagesQty];

      const { hyphenIdsOnPage, hyphenIdsInData } = getHyphenIdsFromCurrentPage();

      if (added) {
        const addedTableIndex = hyphenIdsOnPage.findIndex(id => !hyphenIdsInData.includes(id));
        const addedTableHyphenId = hyphenIdsOnPage[addedTableIndex];

        const tableAddress = addedTableHyphenId && boundCtxGetter.getAddressOfFetchedEarlierTable(addedTableHyphenId, _data.pages);
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

        if (~removedDboItemIndex) { // deleted table is from current shown page
          currPage.dboItems.splice(removedDboItemIndex, 1);
          currPage.tables.splice(removedDboItemIndex, 1);

          reflowTablesAndDboItems(ctx, { currPage, deleted: true });

        } else { // if deleted table not found, search it over all fetched tables (in _data.pages)
          const tableAddress = boundCtxGetter.getAddressOfFetchedEarlierTable(deleted.table.hyphenId, _data.pages);
          if (tableAddress) {
            _data.pages[tableAddress.pageNum].dboItems.splice(tableAddress.tableIndex, 1);
            _data.pages[tableAddress.pageNum].tables.splice(tableAddress.tableIndex, 1);

            reflowTablesAndDboItems(ctx, { currPage: _data.pages[tableAddress.pageNum], deleted: true });
          }
        }

        // remove empty page from _data.pages (it might form after reflowTablesAndDboItems job - table might have been flown to previous page)
        if (!_data.pages[_data.pages.pagesQty].dboItems.length && !_data.pages[_data.pages.pagesQty].tables.length) {
          delete _data.pages[_data.pages.pagesQty];
          _data.pages.pagesQty--;

          // if it is the page currently shown in dashboardInfo, redirect to previous one
          if (_data.currentShownPage === _data.pages.pagesQty + 1) setActivePage(null, ctx._data.pages.pagesQty, undefined, ctx);
          refreshPageButtons();
        }

        // dboItem from shown page might have flown to another page to fill the gap there after deletion, refresh page
        setActivePage(null, ctx._data.currentShownPage, true, ctx);
      }

      if (updated) {

      }
    }

    delete _data.dashboardInfoIsUpdating;
  };



  /**
   * Repack _data.pages if dashboardInfo is changed by abnormal way (not as result of saving, deleting, updating data on server).
   * Normal workflow of dashboardDriver might be broken by manual modifying of dashboardInfo contents.
   */
  const repackDashboardPages = () => {
    _data.dashboardInfoIsUpdating = true;

    let idx = 0;
    for (const dboItem of dashboardInfo.children) {
      const dboItemHyphenIdInDashboard = dboItem.dataset.hyphenId;

      if (!dboItem.classList.value.includes('dbo-head')) {
        const currPage = _data.pages[_data.currentShownPage];
        const dboItemHyphenIdInData = ((currPage.dboItems[idx] || {}).dataset || {}).hyphenId;

        if (dboItemHyphenIdInData !== dboItemHyphenIdInDashboard) {
          let found, page;

          // find where is in _data.pages dboItem with hyphenId like in dashboardInfo's dboItem
          for (let i = 1; i <= _data.pages.pagesQty; i++) {
            page = _data.pages[i];

            const sameDboItemInDataIdx = page.dboItems.findIndex(item => item.dataset.hyphenId === dboItemHyphenIdInDashboard);

            if (~sameDboItemInDataIdx) {
              found = true;
              // update _data.pages
              currPage.dboItems.splice(idx, 0, page.dboItems.splice(sameDboItemInDataIdx, 1)[0]);
              currPage.tables.splice(idx, 0, page.tables.splice(sameDboItemInDataIdx, 1)[0]);
            }
          }

          if (found) {
            if (page !== currPage) { // dboItem from another page added to currPage
              dashboardInfo.children[dashboardInfo.children.length - 1].remove();
              reflowTablesAndDboItems(ctx, { currPage, added: true });

            } else { // currPage's dboItem moved to another position within currPage
              const tables = [];
              const dboItems = [];

              // repack currPage to reflect state of dashboardInfo
              for (const dboItem of dashboardInfo.children) {
                if (!dboItem.classList.value.includes('dbo-head')) {
                  dboItems.push(dboItem);
                  tables.push(currPage.tables.find(table => table.hyphenId === dboItem.dataset.hyphenId));
                }
              }

              currPage.dboItems = dboItems;
              currPage.tables = tables;
            }

          } else { // dboItem with unknown hyphenId, thus not valid, remove it
            dboItem.remove();
          }

          updateDashboardIndexes(ctx._data.maxTablesInDashboardPage, ctx._data.currentShownPage);

          break;
        }

        idx++;
      }
    }

    setTimeout(() => {
      delete _data.dashboardInfoIsUpdating;
    }, 100);
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

            } else { // fetch new tables from server
              (async () => {
                const lastPageTablesQty = _data.pages[_data.pages.pagesQty].tables.length;

                const newTables = await getUserTables(null, {
                  tablesQty: 50,
                  skip: ((_data.pages.pagesQty - 1) * _data.maxTablesInDashboardPage + lastPageTablesQty) || 0,
                });

                if (newTables.length) {
                  const tablesForLastPage = newTables.slice(0, _data.maxTablesInDashboardPage - lastPageTablesQty);
                  const dboItemsForLastPage = addDashboardItemsToPage(tablesForLastPage);

                  const lastPage = _data.pages[_data.pages.pagesQty];
                  lastPage.tables = lastPage.tables.concat(tablesForLastPage);
                  lastPage.dboItems = lastPage.dboItems.concat(dboItemsForLastPage);
                  _data.tablesTotal += tablesForLastPage.length;

                  // refresh current page if it got new data
                  if (_data.currentShownPage === lastPage.pageNum) {
                    setActivePage(null, ctx._data.currentShownPage, true, ctx);
                  }

                  let tablesForOtherPages = newTables.slice(tablesForLastPage.length);
                  while (tablesForOtherPages.length) {
                    const currPageTables = tablesForOtherPages.slice(0, _data.maxTablesInDashboardPage);
                    addDashboardPageToPages(_data.pages, ++_data.pages.pagesQty, currPageTables);

                    _data.tablesTotal += _data.pages[_data.pages.pagesQty].tables.length;
                    tablesForOtherPages.splice(0, _data.maxTablesInDashboardPage);
                  }
                }
              })();
            }
          });
        }
      }
    }
  };

  /**
   * Find out if dashboardInfo is currently being updated by dashboardDriver's normal workflow (due to save, delete, update).
   */
  const isDashboardInfoUpdating = () => _data.dashboardInfoIsUpdating;



  return {
    launch,
    isLaunched,
    getContext,
    getTableFromDashboardPage: boundCtxGetter.getTableFromDashboardPage,
    getAllTablesFromDashboardPage: boundCtxGetter.getAllTablesFromDashboardPage,
    getHyphenIdsFromCurrentPage: boundCtxGetter.getHyphenIdsFromCurrentPage,
    addPageButtons: boundCtxGetter.addPageButtons,
    removePageButtons: boundCtxGetter.removePageButtons,
    refreshPageButtons: boundCtxGetter.refreshPageButtons,
    updateDashboardInfo,
  };
})();

const  {
  launch,
  isLaunched,
  getContext,
  getTableFromDashboardPage,
  getAllTablesFromDashboardPage,
  getHyphenIdsFromCurrentPage,
  addPageButtons,
  removePageButtons,
  refreshPageButtons,
  updateDashboardInfo,
} = dashboardDriver;

export {
  launch,
  isLaunched,
  getContext,
  getTableFromDashboardPage,
  getAllTablesFromDashboardPage,
  getHyphenIdsFromCurrentPage,
  addPageButtons,
  removePageButtons,
  refreshPageButtons,
  updateDashboardInfo,
};
