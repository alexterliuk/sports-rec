const mongoose = require('mongoose');

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
      textareaValue: stringTypeReq,
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

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
