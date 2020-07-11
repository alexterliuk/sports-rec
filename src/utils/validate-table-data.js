const Table = require('../models/table');
const validateTypesInTable = require('./validate-types-in-table');

function validateTableData(reqBody) {
  if (!validateTypesInTable(reqBody)) {
    throw new Error('Some type in the table is different from what specified in table schema.');
  }

  return true;
}

module.exports = validateTableData;
