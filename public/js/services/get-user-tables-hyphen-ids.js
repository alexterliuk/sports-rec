/**
 * Get hyphenIds from all stored tables of current user.
 * @param {string} username
 * @returns {array}
 */
async function getUserTablesHyphenIds(username) {
  const response = await fetch(`/tables/${username}/hyphen-ids`, {
    method: 'GET',
  });

  return response.json();
}
