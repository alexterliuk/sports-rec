/**
 * Save table to server.
 * @param {HTMLButtonElement} btn
 * @param {object} tableData
 */
async function saveTable(btn, tableData) {
  setWaitingState(true, tableData);

  const response = await fetch('http:/tables', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tableData),
  });

  if (response.status === 200) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table successfully saved.', 'success', 3000);
  }

  if (response.status === 400) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'One or more fields of table are not valid.', 'error', 3000);
  }

  if (response.status === 401) {
    setWaitingState(false, tableData);
    notify(tableData.tableId, 'Table not saved. Please authorize.', 'error', 3000);
  }

  if (response.status === 409) {
    const username = mainTableBlock.dataset.username;

    if (username) {
      const hyphenIds = await getUserTablesHyphenIds(username);
      tableData.hyphenId = getBuildDOMLibrary().createHyphenId(hyphenIds);
      saveTable(btn, tableData);

    } else {
      setWaitingState(false, tableData);
      notify(tableData.tableId, 'Table cannot be saved - its hyphenId already taken by another table in database.', 'error', 6000);
    }
  }
}
