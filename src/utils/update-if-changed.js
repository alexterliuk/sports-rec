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

  let idx = 0;
  for (const existingRow of existingTable.tbodyRows) {
    const newRow = reqBody.tbodyRows[idx];
    if (!newRow) break;

    modify(existingRow, newRow, 'id');
    compareRows(existingRow, newRow, 'cells');
    idx++;
  }

  // add or delete rows in tbody
  addDeleteIfDifferentSize(existingTable, reqBody, 'tbodyRows');

  // for each cell in rows invoke modify, modifyArr and addDeleteIfDifferentSize
  function compareRows(oldData, newData, arrKey) {
    let idx = 0;
    for (const existingCell of oldData[arrKey]) {
      const newCell = newData[arrKey][idx];
      if (!newCell) break;

      cellKeys.forEach(key => { modify(existingCell, newCell, key); });
      cellKeysArr.forEach(key => { modifyArr(existingCell, newCell, key); });

      idx++;
    }

    // add or delete cells in theadRow or tbodyRows' row
    addDeleteIfDifferentSize(oldData, newData, arrKey);
  }

  // modify array stored in db to the state of new array
  function addDeleteIfDifferentSize(oldData, newData, arrKey) {
    // add new rows or cells
    if (newData[arrKey].length > oldData[arrKey].length) {
      let idx = oldData[arrKey].length;
      let stop = 0;
      while (newData[arrKey][idx]) {
        oldData[arrKey].push(newData[arrKey][idx]);
        idx++;
        if (++stop === 1000) break;
      }

      // delete rows or cells
    } else if (newData[arrKey].length < oldData[arrKey].length) {
      let stop = 1000;
      while (oldData[arrKey].length !== newData[arrKey].length) {
        oldData[arrKey].pop();
        if (!--stop) break;
      }
    }
  }

  // compare a (data stored in db) and b, modify a to the state of b
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
