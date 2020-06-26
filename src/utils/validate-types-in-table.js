/**
 * Check if all values in reqBody match types specified in tableSchema.
 * This validator is needed because mongoose automatically casts types (e.g. 14 is converted to '14').
 * @param {object} reqBody - request.body
 */
function validateTypesInTable(reqBody) {
  if (typeof reqBody !== 'object' || Array.isArray(reqBody)) return false;

  // types are the same as in tableSchema
  const spec = {
    tableId: 'string',
    hyphenId: 'string',
    tableTitle: 'string',
    classNames: 'array',
    theadRow: 'array',
    tbodyRows: 'array',
    styles: 'array',
    textareaStyles: 'array',
    textareaValue: 'string',
    id: 'string',
    cells: 'array',
  };

  const rootKeys = ['classNames', 'hyphenId', 'tableId', 'tableTitle', 'tbodyRows', 'theadRow'];
  const cellKeys = ['classNames', 'id', 'styles', 'textareaStyles', 'textareaValue'];
  const tbodyRowsKeys = ['id', 'cells'];

  if (!checkTypes(reqBody, rootKeys)) return false;

  for (const cell of reqBody.theadRow) {
    if (!checkTypes(cell, cellKeys)) return false;
  }

  for (const cellsWrapper of reqBody.tbodyRows) {
    if (!checkTypes(cellsWrapper, tbodyRowsKeys)) return false;

    for (const cell of cellsWrapper.cells) {
      if (!checkTypes(cell, cellKeys)) return false;
    }
  }

  return true;

  function checkTypes(obj, keys) {
    for (const key of keys) {
      if (!obj.hasOwnProperty(key)) return false;

      if (typeof obj[key] !== spec[key] && spec[key] !== 'array') {
        return false;
      }

      if (!Array.isArray(obj[key]) && spec[key] === 'array') {
        return false;
      }
    }

    return true;
  }
}

module.exports = validateTypesInTable;
