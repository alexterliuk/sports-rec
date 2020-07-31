/**
 * Check if objects' values are same by calling areObjectsEqualByKeysValues.
 * @param {object} oldData
 * @param {object} currData
 * @param {array} keys - strings
 * @param {string} arrKey - optional
 * @returns {boolean}
 */
function detectChanges(oldData, currData, keys, arrKey) {
  if (!arrKey) return _checkEquality(oldData, currData);

  if (typeof arrKey === 'string') {
    let idx = 0;

    for (const item of oldData) {
      const equal = _checkEquality(item[arrKey], currData[idx][arrKey]);
      if (!equal) return false;
      idx++;
    }

    return true;
  }

  function _checkEquality(oldD, currD) {
    if (Array.isArray(oldD) && Array.isArray(currD)) {
      let idx = 0;

      for (const item of oldD) {
        const _equal = areObjectsEqualByKeysValues(keys, item, currD[idx]);
        if (!_equal) return false;
        idx++;
      }

      return true;
    }
  }
}

/**
 * Check if objects have same values by keys.
 * @param {array} keys - what values to look at for comparing
 * @param {objects} objs
 */
function areObjectsEqualByKeysValues(keys, ...objs) {
  for (const key of keys) {
    if (typeof key !== 'string') return;

    let value = objs[0][key];

    for (const obj of objs) {
      if (value !== obj[key]) return false;
    }
  }
  return !keys.length ? undefined : true;
}
