/**
 * Collect hyphenIds from all tables in dashboardInfo and in _data.pages' page.
 */
function getHyphenIdsFromCurrentPage() {
  const ctx = this.getContext();
  const data = ctx._data;
  const currPage = data.pages[data.currentShownPage];

  const hyphenIdsOnPage = [];
  const hyphenIdsInData = [];

  for (const entity of [[ctx.dashboardInfo.children, hyphenIdsOnPage], [currPage.dboItems, hyphenIdsInData]]) {
    const data = entity[0];
    const arr = entity[1];

    for (const child of data) {
      if (child.classList.value.includes('dbo-item')) {
        arr.push(child.dataset.hyphenId);
      }
    }
  }

  return { hyphenIdsOnPage, hyphenIdsInData };
}

// // result is equivalent to hyphenIdsInData,
// // but data is taken from _data.pages[n].tables (not from ...[n].dboItems as in getHyphenIdsFromCurrentPage)
// function getCurrPageHyphenIds() {
//   const ctx = this.getContext();
//   const data = ctx._data;
//   const currPage = data.pages[data.currentShownPage] || {};
//   return (currPage.tables || []).map(table => table.hyphenId);
// };

export { getHyphenIdsFromCurrentPage };
