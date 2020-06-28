const mongoose = require('mongoose');
const validateIdEndingsInTable = require('../utils/validate-id-endings-in-table');
const validateTypesInTable = require('../utils/validate-types-in-table');

const stringTypeReq = { type: String, required: true };
const arrayTypeReq = { type: Array, required: true };

const tableSchema = new mongoose.Schema({
  tableTitle: {
    type: String,
    required: true,
    trim: true,
  },
  tableId: stringTypeReq,
  hyphenId: stringTypeReq,
  classNames: arrayTypeReq,
  theadRow: [{
    id: stringTypeReq,
    classNames: arrayTypeReq,
    styles: arrayTypeReq,
    textareaStyles: arrayTypeReq,
    textareaValue: stringTypeReq,
  }],
  tbodyRows: [{
    id: stringTypeReq,
    cells: [{
      id: stringTypeReq,
      classNames: arrayTypeReq,
      styles: arrayTypeReq,
      textareaStyles: arrayTypeReq,
      textareaValue: String,
    }],
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timeStamps: true,
});

tableSchema.pre('save', function(next) {
  // All hyphenId endings in table must be equal, non unique id is forbidden
  if (!validateIdEndingsInTable(this)) {
    throw new Error('Non unique id in table detected.');
  }

  // Table must contain proper types
  if (!validateTypesInTable(this)) {
    throw new Error('Some type in the table is different from what specified in table schema.');
  }

  next();
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
