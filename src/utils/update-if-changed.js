/**
 * Compare saved table and new data, if not equal replace old values.
 * @param {object} existingTable
 * @param {object} reqBody
 */
function updateIfChanged(existingTable, reqBody) {
  const cellKeys = ['id', 'textareaValue'];
  const cellKeysArr = ['classNames', 'styles', 'textareaStyles'];

  _modify(existingTable, reqBody, 'tableTitle');
  _modifyArr(existingTable, reqBody, 'classNames');
  _compareRows(existingTable, reqBody, 'theadRow');

  reqBody.tbodyRows.forEach((newRow, idx) => {
    const existingRow = existingTable.tbodyRows[idx];

    _modify(existingRow, newRow, 'id');
    _compareRows(existingRow, newRow, 'cells');
  });

  // for each cell in rows invoke _modify and _modifyArr
  function _compareRows(oldData, newData, arrKey) {
    newData[arrKey].forEach((newCell, idx) => {
      const existingCell = oldData[arrKey][idx];

      cellKeys.forEach(key => { _modify(existingCell, newCell, key); });
      cellKeysArr.forEach(key => { _modifyArr(existingCell, newCell, key); });
    });
  }

  function _modifyArr(a, b, arrKey) {
    // iterate over array of new table (b), because it might contain more values, than array of existing table (a)
    b[arrKey].forEach((val, idx) => {
      if (!a[arrKey].includes(b[arrKey][idx])) {
        a[arrKey].push(b[arrKey][idx]);
      }
    });
  }

  // if target's value is different, replace it with modifier's value
  function _modify(target, modifier, key) {
    if (target[key] !== modifier[key]) {
      target[key] = modifier[key];
    }
  }
}

module.exports = updateIfChanged;
