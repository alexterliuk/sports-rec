import validatePositiveNumber from '../utils/validate-positive-number.js';
import setWaitingState from '../utils/set-waiting-state.js';
import notify from '../table/table-utils/notify.js';

/**
 * Get table.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 * @param {number|boolean} [showResultDuration] - time in ms OR false (response is returned)
 */
async function getTable(btn, { id } = {}, showResultDuration) {
  if (!id) return null;

  const response = await fetch(`/tables/${id}`, {
    method: 'GET',
  });

  if (showResultDuration === false) {
    return response;

  } else {
    const duration = validatePositiveNumber(showResultDuration) || 5000;
    setWaitingState(true, { id: 'dashboardBlock' });

    if (response.status === 200 || response.status === 304) {
      setWaitingState(false, { id: 'dashboardBlock' });
      return response.json();

    } else {
      setWaitingState(false, { id: 'dashboardBlock' });
      notify('dashboardInfo', 'Table not found. Make sure you search own table, not another user\'s one.', 'error', duration);
      return null;
    }
  }
}

export default getTable;
