const Table = require('../models/table');
const validateTypesInTable = require('../utils/validate-types-in-table');

const validateTableData = (req, res, next) => {
  if (!validateTypesInTable(req.body)) {
    return res.status(400).send({ error: 'Some type in the table is different from what specified in table schema.' });
  }

  next();
};

module.exports = validateTableData;
