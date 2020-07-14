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
    const result = await response.json();
    setWaitingState(false, tableData);
    notify(tableData.tableId, result.updated ? 'Table successfully updated.' : 'Empty table deleted.', 'success', 3000);
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

  if (response.status === 500) {
    const result = await response.json();
    setWaitingState(false, tableData);
    notify(tableData.tableId, result.error, 'error', 3000);
  }
}
