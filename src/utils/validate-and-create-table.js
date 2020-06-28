const Table = require('../models/table');
const validateTypesInTable = require('./validate-types-in-table');

function validateAndCreateTable(reqBody) {
  if (!validateTypesInTable(reqBody)) {
    throw new Error('Some type in the table is different from what specified in table schema.');
  }

  return new Table(reqBody);
}

module.exports = validateAndCreateTable;
