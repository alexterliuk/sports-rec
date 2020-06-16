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
            newIds: ['col1', 'col2', 'col3'],
            columnsIds: true,
            textRow: { col1: 'Col 1', col2: 'Col 2', col3: 'Col 3' },
          },
        ],
        callsQty: colsQty,
      },
    },
  ];

  buildDOM(params);
}
