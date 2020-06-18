/**
 * Create table within table-container.
 * @param parentSelector {string}
 * @param contId {string}
 * @param colsQty {number}
 */
function createTableTemplate({ parentSelector, contId, colsQty }) {
  const params = {
    parentSelector,
    contId,
    tagName: 'table',
  };

  const tableId = params.contId;

  params.elems = [
    { parentId: params.contId, tagName: 'thead', $name: 'thead' },
    { parentId: params.contId, tagName: 'tbody', $name: 'tbody' },
    { $parentName: 'thead', tagName: 'tr', $name: 'thead-tr' },
    { $parentName: 'thead-tr',
      builder: {
        funcName: 'addColumn',
        funcArgs: [
          {
            tableId,
            onClick: { funcName: 'sortColumn' },
            onHover: { funcName: 'highlightColumn' },
            columnsIds: ['col1', 'col2', 'col3'],
            columnsNames: ['Col 1', 'Col 2', 'Col 3'],
            cellsTextValues: [
              null, // because row 0 is thead tr
              ['cell 1', 'cell 2', 'cell 3'],
              ['cell 1', 'cell 2', 'cell 3'],
              ['cell 1', 'cell 2', 'cell 3'],
            ]
          },
        ],
        callsQty: colsQty,
      },
    },
  ];

  buildDOM(params);
}
