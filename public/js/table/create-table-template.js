import buildDOM from './build-dom.js';

/**
 * Create table in .table-panel section.
 * @param {string} parentSelector
 * @param {string} contId
 * @param {number} colsQty
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
          },
        ],
        callsQty: colsQty,
      },
    },
  ];

  buildDOM(params);
}

export default createTableTemplate;
