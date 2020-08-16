import { getUserTables } from '../../services/index.js';

/**
 * Add click event listener to prevPage, nextPage.
 * @param {HTMLElement} prevPage
 * @param {HTMLElement} nextPage
 */
function addNavPageButtonClickListeners(prevPage, nextPage) {
  const ctx = this.getContext();
  const data = ctx._data;
  const dataPages = data.pages;

  for (const elem of [prevPage, nextPage]) {
    if (typeof elem === 'object' && elem instanceof HTMLElement) {
      // make sure this is nav button, add functionality of navigation between pageButtons
      if (['prevPage', 'nextPage'].includes(elem.id)) {
        elem.addEventListener('click', event => {
          const pageNum = +event.target.dataset.pageNum;

          if (dataPages[pageNum]) {
            if (event.target.id === 'prevPage') {
              prevPage.dataset.pageNum = pageNum - 1;
              nextPage.dataset.pageNum = +nextPage.dataset.pageNum - 1;

            } else {
              nextPage.dataset.pageNum = pageNum + 1;
              prevPage.dataset.pageNum = +prevPage.dataset.pageNum + 1;
            }

            this.refreshPageButtons({ firstButtonNum: +prevPage.dataset.pageNum + 1});

          } else { // fetch new tables from server
            (async () => {
              const lastPageTablesQty = dataPages[dataPages.pagesQty].tables.length;

              const newTables = await getUserTables(null, {
                tablesQty: 50,
                skip: ((dataPages.pagesQty - 1) * data.maxTablesInDashboardPage + lastPageTablesQty) || 0,
              });

              if (newTables.length) {
                const tablesForLastPage = newTables.slice(0, data.maxTablesInDashboardPage - lastPageTablesQty);
                const dboItemsForLastPage = this.addDashboardItemsToPage(tablesForLastPage);

                const lastPage = dataPages[dataPages.pagesQty];
                lastPage.tables = lastPage.tables.concat(tablesForLastPage);
                lastPage.dboItems = lastPage.dboItems.concat(dboItemsForLastPage);
                data.tablesTotal += tablesForLastPage.length;

                // refresh current page if it got new data
                if (data.currentShownPage === lastPage.pageNum) {
                  this.setActivePage(null, data.currentShownPage, true, ctx);
                }

                let tablesForOtherPages = newTables.slice(tablesForLastPage.length);
                while (tablesForOtherPages.length) {
                  const currPageTables = tablesForOtherPages.slice(0, data.maxTablesInDashboardPage);
                  this.addDashboardPageToPages(dataPages, ++dataPages.pagesQty, currPageTables);

                  data.tablesTotal += dataPages[dataPages.pagesQty].tables.length;
                  tablesForOtherPages.splice(0, data.maxTablesInDashboardPage);
                }
              }
            })();
          }
        });
      }
    }
  }
}

export default addNavPageButtonClickListeners;
