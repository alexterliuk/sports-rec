/**
 * Find a table in all tables in dashboardDriver's _data.pages, return its address in _data.pages.
 * @param {string} hyphenId
 * @param {object} dataPages
 */
function getAddressOfFetchedEarlierTable(hyphenId, dataPages) {
  if (!dataPages) dataPages = this.getContext()._data.pages;

  let found;

  for (let i = 1; i <= dataPages.pagesQty; i++) {
    dataPages[i].dboItems.some((item, idx) => {

      if (item.dataset.hyphenId === hyphenId) {
        found = { pageNum: i, tableIndex: idx };

        return true;
      }
    });

    if (found) return found;
  }
}

/**
 * Get table from page of dashboardDriver's _data.pages.
 * @param {string} hyphenId
 * @param {object} dataPages
 */
function getTableFromDashboardPage(hyphenId, dataPages) {
  if (!dataPages) dataPages = this.getContext()._data.pages;

  if (typeof hyphenId === 'string') {
    const tableAddress = getAddressOfFetchedEarlierTable(hyphenId, dataPages);

    if (tableAddress) {
      return dataPages[tableAddress.pageNum].tables[tableAddress.tableIndex];
    }
  }
}

/**
 * Get all tables from page of dashboardDriver's _data.pages.
 * @param {HTMLButtonElement} btn
 * @param {object} dataPages
 */
function getAllTablesFromDashboardPage(btn, dataPages) {
  if (!dataPages) dataPages = this.getContext()._data.pages;

  const pageNum = +btn.dataset.pageNum;

  if (pageNum > 0 && dataPages[pageNum]) {
    return dataPages[pageNum].tables;
  }
}

export { getAddressOfFetchedEarlierTable, getTableFromDashboardPage, getAllTablesFromDashboardPage};
