import validatePositiveNumber from '../utils/validate-positive-number.js';
import setWaitingState from '../utils/set-waiting-state.js';
import notify from '../table/table-utils/notify.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';

/**
 * Update existing table.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 * @param {number|boolean} [showResultDuration] - time in ms OR false (response is returned)
 */
async function updateTable(btn, tableData, showResultDuration) {
  // exclude tableId and convert data to JSON
  const tableDataJSON = (() => {
    const tData = {};
    Object.keys(tableData).forEach(key => {
      if (key !== 'tableId') tData[key] = tableData[key];
    });
    return JSON.stringify(tData);
  })();

  const response = await fetch('/tables', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: tableDataJSON,
  });

  if (showResultDuration === false) {
    return response;

  } else {
    const duration = validatePositiveNumber(showResultDuration) || getDefaultTimeoutDuration();
    const _notify = (info, success) => { notify(tableData.tableId, info, success || 'error', duration); };
    setWaitingState(true, tableData);

    const result = await response.json();
    setWaitingState(false, tableData);

    if (response.status === 200) {
      _notify(result.updated ? 'Table successfully updated.' : 'Empty table deleted.', 'success');
      return result;
    }

    if (response.status === 400) _notify('One or more fields of table are not valid.');
    if (response.status === 401) _notify('Please authorize.');
    if (response.status === 404) _notify('Table not found.');
    if (response.status === 500) _notify(result.error);
  }
}

export default updateTable;
