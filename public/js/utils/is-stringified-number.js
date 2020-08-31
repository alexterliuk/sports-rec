/**
 * Check whether the whole string can be converted to number.
 * @param {string} str
 * testing: ['019', '-019', '+019', '-0.19', '+01.9', '01.9', '.019', '-.019', '01.95.', '01,9', '019f'].map(str => ({ str, strNum: isStringifiedNumber(str) }));
 */
function isStringifiedNumber(str) {
  if (typeof str !== 'string' || !str.length) return false;

  let dotAlreadyMet;

  return str.split('').every((v, idx) => {
    if (!idx) {
      if (v === '-' || v === '+') return true;
    }

    if (v === '.') {
      if (dotAlreadyMet) return false;
      return dotAlreadyMet = true;
    }

    return v === '0' || parseInt(v);
  });
}

export default isStringifiedNumber;
