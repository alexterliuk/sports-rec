/**
 * Delete table if user confirms.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
async function confirmDeletingTable(btn, { tableId }) {
  if (!tableId) return;

  const confirmed = window.confirm('Are you sure to delete table?');
  if (confirmed) {
    btn.classList.add('no-click'); // avoid secondary click on Delete before table container is removed

    const tableElem = pickElem(tableId);
    const hyphenId = tableElem.dataset.hyphenId;

    const tableDeleted = await deleteTable(btn, { tableId, hyphenId });
    if (tableDeleted.deleted) {
      dashboardDriver.updateDashboardInfo({ deletedTable: shownTables.get(hyphenId) });

    } else {
      btn.classList.remove('no-click');
    }
  }
}
