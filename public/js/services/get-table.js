/**
 * Get table.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 */
async function getTable(btn, { id } = {}) {
  if (!id) return null;
  setWaitingState(true, { id: 'dashboardBlock' });

  const response = await fetch(`http:/tables/${id}`, {
    method: 'GET',
  });

  if (response.status === 200 || response.status === 304) {
    setWaitingState(false, { id: 'dashboardBlock' });
    return response.json();

  } else {
    setWaitingState(false, { id: 'dashboardBlock' });
    notify('dashboardInfo', 'Table not found. Make sure you search own table, not another user\'s one.', 'error', 5000);
    return null;
  }
}
