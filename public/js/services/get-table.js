import validatePositiveNumber from '../utils/validate-positive-number.js';
import setWaitingStateInTable from '../utils/set-waiting-state-in-table.js';
import notify from '../table/table-utils/notify.js';

/**
 * Get table.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 * @param {number|boolean} [showResultDuration] - time in ms OR false (response is returned)
 */
async function getTable(btn, { id } = {}, showResultDuration) {
  if (!id) return null;

  if (showResultDuration !== false) setWaitingStateInTable(true, { id: 'dashboardBlock' });

  const response = await fetch(`/tables/${id}`, {
    method: 'GET',
  });

  if (showResultDuration === false) {
    return response;

  } else {
    const duration = validatePositiveNumber(showResultDuration) || 5000;

    if (response.status === 200 || response.status === 304) {
      setWaitingStateInTable(false, { id: 'dashboardBlock' });
      return response.json();

    } else {
      setWaitingStateInTable(false, { id: 'dashboardBlock' });
      notify('dashboardInfo', 'Table not found. Make sure you search own table, not another user\'s one.', 'error', duration);
      return null;
    }
  }
}

export default getTable;
