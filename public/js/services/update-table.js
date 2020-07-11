/**
 * Update existing table.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 */
async function updateTable(btn, tableData) {
  // exclude tableId and convert data to JSON
  const tableDataJSON = (() => {
    const tData = {};
    Object.keys(tableData).forEach(key => {
      if (key !== 'tableId') tData[key] = tableData[key];
    });
    return JSON.stringify(tData);
  })();

  setWaitingState(true, tableData);

  const response = await fetch('http:/tables', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: tableDataJSON,
  });

  if (response.status === 200) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table successfully updated.', 'success', 3000);
    return true;
  }

  if (response.status === 400) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'One or more fields of table are not valid.', 'error', 3000);
  }

  if (response.status === 401) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Please authorize.', 'error', 3000);
  }

  if (response.status === 404) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table not found.', 'error', 3000);
  }
}
