/**
 * Compare saved table and new data, if not equal replace old values.
 * @param {object} existingTable
 * @param {object} reqBody
 */
function updateIfChanged(existingTable, reqBody) {
  const cellKeys = ['id', 'textareaValue'];
  const cellKeysArr = ['classNames', 'styles', 'textareaStyles'];

  modify(existingTable, reqBody, 'tableTitle');
  modifyArr(existingTable, reqBody, 'classNames');
  compareRows(existingTable, reqBody, 'theadRow');

  reqBody.tbodyRows.forEach((newRow, idx) => {
    const existingRow = existingTable.tbodyRows[idx];

    modify(existingRow, newRow, 'id');
    compareRows(existingRow, newRow, 'cells');
  });

  // for each cell in rows invoke modify and modifyArr
  function compareRows(oldData, newData, arrKey) {
    newData[arrKey].forEach((newCell, idx) => {
      const existingCell = oldData[arrKey][idx];

      cellKeys.forEach(key => { modify(existingCell, newCell, key); });
      cellKeysArr.forEach(key => { modifyArr(existingCell, newCell, key); });
    });
  }

  function modifyArr(a, b, arrKey) {
    const newValues = []; // classNames, styles or textareaStyles

    for (let i = b[arrKey].length - 1; i >= 0; i--) {
      // exclude possible same values occurrence
      arrKey !== 'classNames' ?
        addValueIfNotExist(newValues, b[arrKey], i, 'name') :
        addValueIfNotExist(newValues, b[arrKey], i);
    }

    // add new values to saved array
    newValues.forEach((val, idx) => {
      a[arrKey].splice(idx, 1, val);
    });

    // remove any values in saved array that new array doesn't have
    if (newValues.length) {
      a[arrKey].length = newValues.length;

    } else {
      // assigning zero length doesn't work (values will remain in db), so remove values one by one
      let stop = 0;
      while (a[arrKey].length) {
        a[arrKey].pop();
        if (++stop === 1000) break;
      }
    }
  }

  // if target's value is different, replace it with modifier's value
  function modify(target, modifier, key) {
    if (target[key] !== modifier[key]) {
      target[key] = modifier[key];
    }
  }

  // if target has no such value, add it
  function addValueIfNotExist(target, arr, i, key) {
    const valueNotExist = !target.find(val => key ? val[key] === arr[i][key] : val === arr[i]);
    if (valueNotExist) target.unshift(arr[i]);
  }
}

module.exports = updateIfChanged;
