import reflowTablesAndDboItems from './reflow-tables-and-dbo-items.js';
import updateDashboardIndexes from './update-dashboard-indexes.js';

/**
 * Repack _data.pages if dashboardInfo is changed by abnormal way (not as result of saving, deleting, updating data on server).
 * Normal workflow of dashboardDriver might be broken by manual modifying of dashboardInfo contents.
 */
function repackDashboardPages() {
  const ctx = this.getContext();
  const dashboardInfo = ctx.dashboardInfo;
  const data = ctx._data;
  const dataPages = data.pages;
  const currentShownPage = data.currentShownPage;
  const maxTablesInDashboardPage = data.maxTablesInDashboardPage;

  data.dashboardInfoIsUpdating = true;

  let idx = 0;
  for (const dboItem of dashboardInfo.children) {
    const dboItemHyphenIdInDashboard = dboItem.dataset.hyphenId;

    if (!dboItem.classList.value.includes('dbo-head')) {
      const currPage = dataPages[currentShownPage];
      const dboItemHyphenIdInData = ((currPage.dboItems[idx] || {}).dataset || {}).hyphenId;

      if (dboItemHyphenIdInData !== dboItemHyphenIdInDashboard) {
        let found, page;

        // find where is in _data.pages dboItem with hyphenId like in dashboardInfo's dboItem
        for (let i = 1; i <= dataPages.pagesQty; i++) {
          page = dataPages[i];

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

        updateDashboardIndexes(maxTablesInDashboardPage, currentShownPage);

        break;
      }

      idx++;
    }
  }

  setTimeout(() => {
    delete data.dashboardInfoIsUpdating;
  }, 100);
}

export { repackDashboardPages };
