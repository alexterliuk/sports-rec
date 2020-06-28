/**
 * Get hyphenIds from all tables stored in database.
 * @returns {array}
 */
async function getAllTablesHyphenIds() {
  const response = await fetch(`http:/tables/hyphen-ids`, {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get hyphenIds from all stored tables of current user.
 * @param {string} username
 * @returns {array}
 */
async function getUserTablesHyphenIds(username) {
  const response = await fetch(`http:/tables/${username}/hyphen-ids`, {
    method: 'GET',
  });

  return response.json();
}
