import setWaitingState from '../utils/set-waiting-state.js';
import notify from '../table/table-utils/notify.js';

/**
 * Delete table in database.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 */
async function deleteTable(btn, tableData) {
  if (!tableData) return { deleted: false };

  setWaitingState(true, tableData);

  const response = await fetch(`/tables/${tableData.hyphenId}`, {
    method: 'DELETE',
  });

  if (response.status === 200) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table successfully deleted.', 'success', 3000);
    return { deleted: true };

  } else if (response.status === 404) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table not found.', 'error', 3000);
    return { deleted: false };

  } else {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Failed to delete. Something went wrong.', 'error', 3000);
    return { deleted: false };
  }
}

export default deleteTable;
