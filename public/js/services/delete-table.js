import setWaitingState from '../utils/set-waiting-state.js';
import notify from '../table/table-utils/notify.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';

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

  const duration = getDefaultTimeoutDuration();

  if (response.status === 200) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table successfully deleted.', 'success', duration);
    return { deleted: true };

  } else if (response.status === 404) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table not found.', 'error', duration);
    return { deleted: false };

  } else {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Failed to delete. Something went wrong.', 'error', duration);
    return { deleted: false };
  }
}

export default deleteTable;
