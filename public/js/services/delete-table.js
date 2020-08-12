import validatePositiveNumber from '../utils/validate-positive-number.js';
import setWaitingState from '../utils/set-waiting-state.js';
import notify from '../table/table-utils/notify.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';

/**
 * Delete table in database.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 * @param {number|boolean} [showResultDuration] - time in ms OR false (response returns)
 */
async function deleteTable(btn, tableData, showResultDuration) {
  if (!tableData) return { deleted: false };

  const response = await fetch(`/tables/${tableData.hyphenId}`, {
    method: 'DELETE',
  });

  if (showResultDuration === false) {
    return response;

  } else {
    const duration = validatePositiveNumber(showResultDuration) || getDefaultTimeoutDuration();
    setWaitingState(true, tableData);

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
}

export default deleteTable;
