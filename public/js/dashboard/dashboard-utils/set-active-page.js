/**
 * Show desired page.
 * @param {Event} event
 * @param {number} pageNum
 * @param {boolean} refresh
 * @param {object} ctx
 */
function setActivePage (event, pageNum, refresh, ctx) {
  if (!ctx) ctx = this.getContext();

  ctx._data.dashboardInfoIsUpdating = true;

  if (event) pageNum = +event.target.dataset.pageNum;

  if (ctx._data.pages[pageNum] && refresh || ctx._data.pages[pageNum] && !ctx._data.pages[pageNum].shown) {
    ctx.buildAllTheseTables.dataset.pageNum = pageNum;

    // remove current page
    let stop = 0;
    while (ctx.dashboardInfo.children.length !== 1) {
      ctx.dashboardInfo.children[ctx.dashboardInfo.children.length - 1].remove();
      if (++stop === 1000) break;
    }

    if (ctx._data.pages[pageNum].dboItems.length === ctx._data.maxTablesInDashboardPage) {
      ctx.dashboardInfo.classList.add('maxTablesInDashboardPageHeight');
    } else {
      ctx.dashboardInfo.classList.remove('maxTablesInDashboardPageHeight');
    }

    // add new page
    ctx.dashboardInfo.classList.add('spinner');
    setTimeout(() => { ctx.dashboardInfo.classList.remove('spinner') }, 100);
    ctx._data.pages[pageNum].dboItems.forEach(item => {
      // can be used for visual effects:
      // let delay = 0;
      // setTimeout(() => visualizeWhileAppending(dashboardInfo, item), delay += 10);
      ctx.dashboardInfo.append(item);
    });

    if (ctx._data.currentShownPage && ctx._data.pages[ctx._data.currentShownPage]) {
      ctx._data.pages[ctx._data.currentShownPage].shown = false;
      ctx._data.pages[ctx._data.currentShownPage].pageButton.classList.remove('active');
    }

    ctx._data.pages[pageNum].shown = true;
    ctx._data.pages[pageNum].pageButton.classList.add('active');
    ctx._data.currentShownPage = pageNum;

    updateDashboardIndexes();
  }

  delete ctx._data.dashboardInfoIsUpdating;
}

export default setActivePage;
