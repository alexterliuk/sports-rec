/**
 * Get all tables of logged in user.
 * @param {HTMLButtonElement} btn
 * @param {object} options - e.g. { limit: 10, skip: 20 }
 */
async function getUserTables(btn, options) {
  setWaitingState(true, { id: 'dashboardBlock' });

  const queryStrings = makeQueryStrings(options, ['limit', 'skip'], 'number');
  const baseUrl = 'http:/tables';
  const url = queryStrings ? `${baseUrl}?${queryStrings}` : baseUrl;

  const response = await fetch(url, { method: 'GET' });

  if (response.status === 200 || response.status === 304) {
    setWaitingState(false, { id: 'dashboardBlock' });
    const _response = await response.json();
    buildTables(_response);

  } else {
    setWaitingState(false, { id: 'dashboardBlock' });
    notify('dashboardInfo', 'Something went wrong.', 'error', 3000);
  }
}
