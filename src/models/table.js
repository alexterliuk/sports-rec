const mongoose = require('mongoose');
const validateIdEndingsInTable = require('../utils/validate-id-endings-in-table');

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
  timestamps: true,
});

// All hyphenId endings in table must be equal, non unique id is forbidden
tableSchema.pre('save', function(next) {
  if (!validateIdEndingsInTable(this)) {
    throw new Error('Non unique id in table detected.');
  }

  next();
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
