const mongoose = require('mongoose');
const validateIdEndingsInTable = require('../utils/validate-id-endings-in-table');
const { validateHyphenId } = require('../utils/check-string');

const stringTypeReq = {
  type: String,
  required: true,
};

const styleType = [{
  name: String,
  value: String,
  _id: false,
}];

const cellType = [{
  id: stringTypeReq,
  _id: false,
  classNames: [ String ],
  styles: styleType,
  textareaStyles: styleType,
  textareaValue: String,
}];

const tableSchema = new mongoose.Schema({
  tableTitle: {
    type: String,
    required: true,
    trim: true,
  },
  hyphenId: stringTypeReq,
  classNames: [ String ],
  theadRow: cellType,
  tbodyRows: [{
    id: stringTypeReq,
    _id: false,
    cells: cellType,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// All hyphenId endings in table must be equal, non unique id is forbidden, table.dataset.hyphenId must be correct
tableSchema.pre('save', function(next) {
  const idsValidity = validateIdEndingsInTable(this);
  if (!idsValidity.uniqueId) {
    const rec = idsValidity;

    const recCol = rec.columnId && `Non unique column id ${rec.columnId} at column ${rec.columnIndex} in table detected.`;
    const recRow = rec.rowId && `Non unique row id ${rec.rowId} at row ${rec.rowIndex} in table detected.`;
    const recCell = rec.cellId && `Non unique cell id ${rec.cellId} at cell ${rec.cellIndex} of row ${rec.rowIndex} in table detected.`;

    throw new Error(recCol || recRow || recCell);
  }

  if (!validateHyphenId(this.hyphenId)) {
    throw new Error('Hyphen id in table is not valid. It must consist of \'-\' followed by 3 lowercase letters.');
  }

  next();
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
