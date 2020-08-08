import buildDOM from './build-dom.js';

/**
 * Create table in .table-panel section.
 * @param {string} parentSelector
 * @param {string} contId
 * @param {number} colsQty
 * @param {object} tableData
 */
function createTable({ parentSelector, contId, colsQty }, tableData) {
  const params = {
    parentSelector,
    contId,
    tagName: 'table',
    hyphenId: tableData.hyphenId,
    class: tableData.classNames,
  };

  const tableId = params.contId;

  params.elems = [
    { parentId: params.contId, tagName: 'thead', $name: 'thead' },
    { parentId: params.contId, tagName: 'tbody', $name: 'tbody' },
    { $parentName: 'thead', tagName: 'tr', $name: 'thead-tr' },
    { $parentName: 'thead-tr',
      builder: {
        funcName: 'addColumn',
        funcArgs: [ makeTableSpecs() ],
        callsQty: colsQty || tablesConfig.getConfigItem('colsQty'),
      },
    },
  ];

  buildDOM(params);

  const { hyphenId, theadRow, tbodyRows } = tableData;
  shownTables.addToTable(hyphenId, { theadRow });
  shownTables.addToTable(hyphenId, { tbodyRows });

  /**
   * Make funcArgs for addColumn
   */
  function makeTableSpecs() {
    const funcArgs = {
      tableId,
      // onClick: { funcName: 'sortColumn' },
      // onHover: { funcName: 'highlightColumn' },
    };

    addColumnsIdsAndNames();
    addRowsIdsAndCellsData();

    return funcArgs;

    /**
     * Add columns ids and names to funcArgs.
     */
    function addColumnsIdsAndNames() {
      funcArgs.columnsIds = [];
      funcArgs.columnsNames = [];

      tableData.theadRow.forEach(column => {
        funcArgs.columnsIds.push(column.id);
        funcArgs.columnsNames.push(column.textareaValue);
      });
    }

    /**
     * Add rows ids and cells data to funcArgs.
     */
    function addRowsIdsAndCellsData() {
      funcArgs.rowsIds = [];
      funcArgs.cellsIds = [];
      funcArgs.cellsTextValues = [];
      funcArgs.cellsClassNames = {};
      funcArgs.cellsStyles = {};
      funcArgs.cellsTextareaStyles = {};

      tableData.tbodyRows.forEach(row => {
        funcArgs.rowsIds.push(row.id);
        const textRow = [];
        const cellsIdsInRow = [];

        row.cells.forEach(cell => {
          textRow.push(cell.textareaValue);
          cellsIdsInRow.push(cell.id);
          funcArgs.cellsClassNames[cell.id] = cell.classNames;
          funcArgs.cellsStyles[cell.id] = cell.styles;
          funcArgs.cellsTextareaStyles[cell.id] = cell.textareaStyles;
        });

        funcArgs.cellsTextValues.push(textRow);
        funcArgs.cellsIds.push(cellsIdsInRow);
      });
    }
  }
}

export default createTable;
