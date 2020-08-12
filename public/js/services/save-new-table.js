import getUserTablesHyphenIds from './get-user-tables-hyphen-ids.js';
import setWaitingState from '../utils/set-waiting-state.js';
import notify from '../table/table-utils/notify.js';
import getDefaultTimeoutDuration from '../utils/get-default-timeout-duration.js';

/**
 * Save new table to server.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 */
async function saveNewTable(btn, tableData) {
  // exclude tableId and convert data to JSON
  const tableDataJSON = (() => {
    const tData = {};
    Object.keys(tableData).forEach(key => {
      if (key !== 'tableId') tData[key] = tableData[key];
    });
    return JSON.stringify(tData);
  })();

  setWaitingState(true, tableData);

  const response = await fetch('/tables/new', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: tableDataJSON,
  });

  const duration = getDefaultTimeoutDuration();

  if (response.status === 200) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table successfully saved.', 'success', duration);
    return true;
  }

  if (response.status === 400) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'One or more fields of table are not valid.', 'error', duration);
  }

  if (response.status === 401) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table not saved. Please authorize.', 'error', duration);
  }

  if (response.status === 409) {
    const username = mainTableBlock.dataset.username;

    if (username) {
      const hyphenIds = await getUserTablesHyphenIds(username);
      tableData.hyphenId = getBuildDOMLibrary().createHyphenId(hyphenIds);
      saveNewTable(btn, tableData);

    } else {
      setWaitingState(false, tableData);
      notify(tableData.tableId, 'Table cannot be saved - its hyphenId already taken by another table in database.', 'error', 6000);
    }
  }
}

export default saveNewTable;
