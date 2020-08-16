import { getTableFromDashboardPage, getContext } from '../dashboard-driver.js';
import setActivePage from './set-active-page.js';
import createDashboardItems from '../create-dashboard-items.js';
import { getPageButtonSpec } from './dashboard-page-buttons-creating-utils.js';
import buildDOM from '../../table/build-dom.js';

/**
 * Add page to dashboardDriver's _data.pages (or to temporary object which in a moment will become dashboardDriver's _data.pages).
 * @param {object} pages
 * @param {number} pageNum
 * @param {array} tables
 * @param {array} dboItems
 */
function addDashboardPageToPages(pages, pageNum, tables, dboItems) {
  pages[pageNum] = {
    pageNum,
    tables,
    dboItems: dboItems || addDashboardItemsToPage(tables),
    pageButton: addDashboardPageButtonToPage(pageNum),
    shown: false,
  };

  return pages[pageNum];
}

/**
 * Add page template with empty tables and dboItems to dashboardDriver's _data.pages.
 * @param {object} pages
 */
function addEmptyDashboardPageToPages(pages) {
  const pageNum = pages.pagesQty + 1;
  pages[pageNum] = {
    pageNum,
    tables: [],
    dboItems: [],
    pageButton: addDashboardPageButtonToPage(pageNum),
    shown: false,
  };

  return pages[pageNum];
}

/**
 * Add elements (div.dbo-item) to dashboardDriver's _data.pages' page.
 * @param {array} tables - tables of one page
 */
function addDashboardItemsToPage(tables) {
  return (collection => {
    const items = [];

    while (collection.children.length) {
      items.push(collection.removeChild(collection.children[0]));
    }

    return items;
  })(createDashboardItems(tables));
}

/**
 * Add a span used as page number button to dashboardDriver's _data.pages' page.
 * @param {number} pageNum
 */
function addDashboardPageButtonToPage(pageNum) {
  const parentElement = document.createElement('div');
  const params = {
    parentElement,
    elems: [ getPageButtonSpec({ parentElement, pageNum }) ],
  };

  buildDOM(params);
  parentElement.children[0].addEventListener('click', setActivePage.bind({ getContext }));

  return parentElement.children[0];
}

/**
 * Take dboItem's hyphenId and get table from dashboard driver.
 * @param {HTMLButtonElement} btn
 */
function getTableFromDboItem(btn) {
  if (typeof btn === 'object' && btn instanceof HTMLButtonElement) {
    const dboItem = btn.parentElement && btn.parentElement.parentElement;

    if (dboItem && dboItem.dataset.hyphenId) {
      return getTableFromDashboardPage(dboItem.dataset.hyphenId);
    }
  }
}

export {
  addDashboardPageToPages,
  addEmptyDashboardPageToPages,
  addDashboardItemsToPage,
  addDashboardPageButtonToPage,
  getTableFromDboItem,
};
