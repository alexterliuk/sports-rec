/**
 * Make and concatenate query strings with & in-between.
 * @param {object} options - e.g. { limit: 10, skip: 20 }
 * @param {array} queryStringsKeys - keys to look for into options and make query strings, e.g. ['limit']
 * @param {string} makingType - type an options[key] value expected to be of before converting to query string
 * @returns {string} - query string | query strings united in one string | ''
 */
function makeQueryStrings(options, queryStringsKeys, makingType) {
  const makingTypes = ['number'];

  if (typeof options !== 'object' || !makingTypes.includes(makingType)) return '';

  const makeQueryStringFrom = {
    number: key => (int => int > 0 && `${key}=${int}`)(parseInt(data.opts[key], 10)),
  };

  const data = (() => {
    const keys = Array.isArray(queryStringsKeys) && queryStringsKeys.length && queryStringsKeys || Object.keys(options);
    const opts = {};

    for (const key of keys) opts[key] = options[key];

    return Object.keys(opts).length ? { opts, keys } : false;
  })();

  const queryStrings = data && data.keys.map(key => makeQueryStringFrom[makingType](key));

  return (queryStrings || []).filter(val => val).join('&');
}

export default makeQueryStrings;
