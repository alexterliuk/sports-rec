/**
 * Add page buttons.
 * @param {number} firstButtonNum
 */
function addPageButtons(firstButtonNum/*, delay*/) {
  if (!firstButtonNum || firstButtonNum < 0) firstButtonNum = 1;

  const ctx = this.getContext();
  const data = ctx._data;
  const dataPages = data.pages;
  const maxButtonsInRow = data.maxButtonsInRow;

  setTimeout(() => {
    ctx.dashboardPagination.classList.add('active');
  }, 250);

  setTimeout(() => {
    let lastPage = dataPages[firstButtonNum + maxButtonsInRow - 1];
    let stop = 0;
    while (!lastPage) {
      lastPage = dataPages[--firstButtonNum + maxButtonsInRow];
      if (++stop === 1000) break;
    }

    let stop2 = 0;
    const stopNum = lastPage.pageNum < maxButtonsInRow ? 0 : lastPage.pageNum - maxButtonsInRow;
    for (let i = lastPage.pageNum; i !== stopNum; i--) {
      ctx.dashboardPages.prepend(dataPages[i].pageButton);
      if (++stop2 === 1000) break;
    }

    refreshNavPageButtons(ctx.dashboardPages, ctx.prevPage, ctx.nextPage);
  }, /*delay || delay === 0 || */500);
}

/**
 * Remove page buttons and close dashboardPagination.
 */
function removePageButtons() {
  const ctx = this.getContext();
  const dpC = ctx.dashboardPages.children;

  if (dpC[0]) {
    let stop = 0;
    while (dpC.length) {
      dpC[dpC.length - 1].remove();
      if (++stop === 1000) break;
    }

    ctx.prevPage.dataset.pageNum = 0;
    ctx.nextPage.dataset.pageNum = 0;
    ctx.dashboardPagination.classList.remove('active');
  }
}

/**
 * Refresh dashboardPages due to adding/deleting of a page or navigating between page buttons.
 * @param {number} firstButtonNum
 * @param {object} newPage
 */
function refreshPageButtons({ firstButtonNum, newPage } = {}) {
  const ctx = this.getContext();
  const dp = ctx.dashboardPages;
  const dpC = dp.children;
  const dataPages = ctx._data.pages;
  const maxButtonsInRow = ctx._data.maxButtonsInRow;

  const firstPageNum = +dpC[0].dataset.pageNum;
  const lastPageNum = +dpC[dpC.length - 1].dataset.pageNum;

  if (firstButtonNum) { // navigation button clicked
    if (firstButtonNum < +dpC[0].dataset.pageNum) { // prevPage clicked
      dpC[dpC.length - 1].remove();
      dp.prepend(dataPages[firstButtonNum].pageButton);

    } else { // nextPage clicked
      dpC[0].remove();
      dp.append(dataPages[lastPageNum + 1].pageButton);
    }

  } else if (newPage && dpC.length < maxButtonsInRow) {
    dp.append(newPage.pageButton);
    refreshNavPageButtons(dp, ctx.prevPage, ctx.nextPage);

  } else { // last page might have been deleted
    let lastPage = dpC[dpC.length - 1];

    let stop = 0;
    while (dpC.length && !dataPages[lastPage.dataset.pageNum]) {
      lastPage.remove();
      lastPage = dpC[dpC.length - 1];

      if (firstPageNum !== 1) {
        dp.prepend(dataPages[firstPageNum - 1].pageButton);
      }
      if (++stop === 1000) break;
    }

    refreshNavPageButtons(dp, ctx.prevPage, ctx.nextPage);
  }
}

/**
 * Refresh navigational buttons to prev, next pages.
 * @param {HTMLElement} dashboardPages
 * @param {HTMLElement} prevPage
 * @param {HTMLElement} nextPage
 */
function refreshNavPageButtons(dashboardPages, prevPage, nextPage) {
  const dpC = dashboardPages.children;

  if (!dpC.length) return;

  const firstPageNumInRow = +dpC[0].dataset.pageNum;
  prevPage.dataset.pageNum = firstPageNumInRow - 1;

  const lastPageNumInRow = +dpC[dpC.length - 1].dataset.pageNum;
  nextPage.dataset.pageNum = lastPageNumInRow + 1;
}

export { addPageButtons, removePageButtons, refreshPageButtons };
