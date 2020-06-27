/**
 * Save table to server.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 */
async function saveTable(btn, tableData) {
  setWaitingState(true, tableData.tableId);

  const response = await fetch('http:/table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tableData),
  });

  if (response.status === 200) {
    setWaitingState(false, tableData.tableId);
    notify(tableData.tableId, 'Table successfully saved.', 'success', 3000);
  }

  if (response.status === 400) {
    setWaitingState(false, tableData.tableId);
    notify(tableData.tableId, 'One or more fields of table are not valid.', 'error', 3000);
  }

  if (response.status === 401) {
    setWaitingState(false, tableData.tableId);
    notify(tableData.tableId, 'Table not saved. Please authorize.', 'error', 3000);
  }

  if (response.status === 409) {
    let hyphenIds = await (await fetch('http:/table/hyphen-ids', { method: 'GET' })).json();
    tableData.hyphenId = getBuildDOMLibrary().createHyphenId(hyphenIds);

    saveTable(btn, tableData);
  }
}
