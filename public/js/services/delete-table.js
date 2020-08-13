import validatePositiveNumber from '../utils/validate-positive-number.js';
import setWaitingStateInTable from '../utils/set-waiting-state-in-table.js';
import notify from '../table/table-utils/notify.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';

/**
 * Delete table in database.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 * @param {number|boolean} [showResultDuration] - time in ms OR false (response is returned)
 */
async function deleteTable(btn, tableData, showResultDuration) {
  if (!tableData) return { deleted: false };

  if (showResultDuration !== false) setWaitingStateInTable(true, tableData);

  const response = await fetch(`/tables/${tableData.hyphenId}`, {
    method: 'DELETE',
  });

  if (showResultDuration === false) {
    return response;

  } else {
    const duration = validatePositiveNumber(showResultDuration) || getDefaultTimeoutDuration();

    if (response.status === 200) {
      setWaitingStateInTable(false, tableData);
      notify(tableData.tableId, 'Table successfully deleted.', 'success', duration);
      return { deleted: true };

    } else if (response.status === 404) {
      setWaitingStateInTable(false, tableData);
      notify(tableData.tableId, 'Table not found.', 'error', duration);
      return { deleted: false };

    } else {
      setWaitingStateInTable(false, tableData);
      notify(tableData.tableId, 'Failed to delete. Something went wrong.', 'error', duration);
      return { deleted: false };
    }
  }
}

export default deleteTable;
