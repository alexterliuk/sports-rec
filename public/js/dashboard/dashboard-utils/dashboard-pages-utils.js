/**
 * Add elements (div.dbo-item) to dashboardDriver's _data.pages' page.
 * @param {array} tables - tables of one page
 */
function addDashboardItemsToPage(tables) {
  return (collection => {
    const items = [];
    for (const elem of collection) items.push(elem);

    return items;
  })(createDashboardItems(tables).children);
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
  return parentElement.children[0];
}

/**
 * Add 'Build All These Tables' button to dashboardDriver's _data.pages' page.
 * @param {array} tables - tables of one page
 * @param {number} pageNum
 */
function addBuildAllTheseTablesButtonToPage({ tables, pageNum }) {
  const parentElement = document.createElement('div');

  const params = {
    parentElement,
    elems: [{
      parentElement, tagName: 'button', text: 'Build All These Tables',
      newId: 'buildAllTheseTables',
      dataset: [{ key: 'pageNum', value: pageNum }],
      onClick: { funcName: 'buildTables', funcArgs: [ tables ] },
    }],
  };

  buildDOM(params);
  return parentElement.children[0];
}

/**
 * Add page to pages (in a moment pages will become dashboardDriver's _data.pages).
 * @param {object} pages
 * @param {array} tables
 * @param {number} pageNum
 */
function addDashboardPageToPages(pages, tables, pageNum) {
  pages[pageNum] = {
    tables,
    dboItems: addDashboardItemsToPage(tables),
    button: addDashboardPageButtonToPage(pageNum),
    shown: false,
    buildAllTheseTables: addBuildAllTheseTablesButtonToPage({ tables, pageNum }),
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
    tables: [],
    dboItems: [],
    button: addDashboardPageButtonToPage(pageNum),
    shown: false,
    buildAllTheseTables: addBuildAllTheseTablesButtonToPage({ tables: undefined, pageNum }),
  };

  return pages[pageNum];
}
