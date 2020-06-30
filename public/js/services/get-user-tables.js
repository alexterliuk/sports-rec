/**
 * Get all tables of logged in user.
 * @param {HTMLButtonElement} btn
 */
async function getUserTables(btn) {
  setWaitingState(true, { id: 'dashboardBlock' });

  const response = await fetch('http:/tables', {
    method: 'GET',
  });

  if (response.status === 200 || response.status === 304) {
    setWaitingState(false, { id: 'dashboardBlock' });
    const _response = await response.json();
    buildTables(_response);

  } else {
    setWaitingState(false, { id: 'dashboardBlock' });
    notify('dashboardInfo', 'Something went wrong.', 'error', 3000);
  }
}
