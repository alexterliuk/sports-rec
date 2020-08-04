/**
 * Get hyphenIds from all tables stored in database.
 * @returns {array}
 */
async function getAllTablesHyphenIds() {
  const response = await fetch(`https:/tables/hyphen-ids`, {
    method: 'GET',
  });

  return response.json();
}
