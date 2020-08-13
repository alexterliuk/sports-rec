import getUserTablesHyphenIds from './get-user-tables-hyphen-ids.js';
import validatePositiveNumber from '../utils/validate-positive-number.js';
import setWaitingStateInTable from '../utils/set-waiting-state-in-table.js';
import notify from '../table/table-utils/notify.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';

/**
 * Save new table to server.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 * @param {number|boolean} [showResultDuration] - time in ms OR false (response is returned)
 */
async function saveNewTable(btn, tableData, showResultDuration) {
  // exclude tableId and convert data to JSON
  const tableDataJSON = (() => {
    const tData = {};
    Object.keys(tableData).forEach(key => {
      if (key !== 'tableId') tData[key] = tableData[key];
    });
    return JSON.stringify(tData);
  })();

  if (showResultDuration !== false) setWaitingStateInTable(true, tableData);

  const response = await fetch('/tables/new', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: tableDataJSON,
  });

  if (showResultDuration === false) {
    return response;

  } else {
    const duration = validatePositiveNumber(showResultDuration) || getDefaultTimeoutDuration();

    if (response.status === 200) {
      setWaitingStateInTable(false, tableData);
      notify(tableData.tableId, 'Table successfully saved.', 'success', duration);
      return true;
    }

    if (response.status === 400) {
      setWaitingStateInTable(false, tableData);
      notify(tableData.tableId, 'One or more fields of table are not valid.', 'error', duration);
    }

    if (response.status === 401) {
      setWaitingStateInTable(false, tableData);
      notify(tableData.tableId, 'Table not saved. Please authorize.', 'error', duration);
    }

    if (response.status === 409) {
      const username = mainTableBlock.dataset.username;

      if (username) {
        const hyphenIds = await getUserTablesHyphenIds(username);
        tableData.hyphenId = getBuildDOMLibrary().createHyphenId(hyphenIds);
        saveNewTable(btn, tableData);

      } else {
        setWaitingStateInTable(false, tableData);
        notify(tableData.tableId, 'Table cannot be saved - its hyphenId already taken by another table in database.', 'error', 6000);
      }
    }
  }
}

export default saveNewTable;
