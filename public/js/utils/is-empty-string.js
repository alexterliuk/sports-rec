/**
 * Strip off whitespaces and test whether string is empty.
 * @param {string} str
 * @returns {boolean}
 */
function isEmptyString(str) {
  return typeof str !== 'string' ? false : !str.trim().length;
}
