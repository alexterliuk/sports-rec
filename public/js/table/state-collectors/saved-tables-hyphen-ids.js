/**
 * Collector of hyphen ids from all saved tables of a user.
 */
const savedTablesHyphenIds = (function() {
  let _savedTablesHyphenIds = [];

  const _modify = async () => {
    const username = await getUsername();

    if (username) {
      const hyphenIds = await getUserTablesHyphenIds(username);
      if (hyphenIds) _savedTablesHyphenIds = hyphenIds;
    }
  };

  const add = () => { !_savedTablesHyphenIds.length && _modify(); };
  const replace = () => { _savedTablesHyphenIds.length && _modify(); };
  const get = () => [..._savedTablesHyphenIds];
  const remove = () => { _savedTablesHyphenIds = []; };

  return { add, get, remove, replace };
})();
