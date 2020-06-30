/**
 * Get table.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 */
async function getTable(btn, id) {
  setWaitingState(true, { id: 'dashboardBlock' });

  const response = await fetch(`http:/tables/${id}`, {
    method: 'GET',
  });

  if (response.status === 200 || response.status === 304) {
    setWaitingState(false, { id: 'dashboardBlock' });
    const _response = await response.json();
    buildTables([_response]);

  } else {
    setWaitingState(false, { id: 'dashboardBlock' });
    notify('dashboardInfo', 'Table not found. Make sure you search own table, not another user\'s one.', 'error', 5000);
  }
}
