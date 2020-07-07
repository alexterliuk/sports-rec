/**
 * Test whether string is empty, or composed only of whitespaces.
 * @param {string} str
 * @returns {boolean}
 */
function isEmptyString(str) {
  if (typeof str !== 'string') return false;

  // true if any character inside
  const notEmptyString = str.split('').some(v => !/\s/.test(v));
  return !notEmptyString;
}
