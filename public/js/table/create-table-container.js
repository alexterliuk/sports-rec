import buildDOM from './build-dom.js';
import createTable from './create-table.js';
import createTableTemplate from './create-table-template.js';

/**
 * Create page section with .table-title, .buttons-block and .panels-block where a table will reside.
 * @param {object} tableData
 */
function createTableContainer(tableData) {
  // Do not create a table which already exists on page.
  if (tableData && shownTables.get(tableData.hyphenId)) return;

  const containerId = (() => {
    let mtbNum = 1;
    while (pickElem(`mtb${mtbNum}`)) mtbNum++;
    return mtbNum;
  })();

  const params = {
    parentId: 'mainTableBlock',
    contId: `mtb${containerId}`,
  };

  const tableId = `${params.contId}Table`;

  const addButtonSpec = (funcName, funcArgs, text, classArr) => {
    return {
      $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName, funcArgs: [funcArgs] },
      text,
      class: classArr || [],
    };
  };

  params.elems = [
    { parentId: params.contId, tagName: 'div', class: ['table-title-container'], $name: 'table-title-container' },
    { $parentName: 'table-title-container', tagName: 'h2', class: ['table-title'],
      text: tableData && tableData.tableTitle || `Table ${containerId}`,
    },
    { $parentName: 'table-title-container', tagName: 'input' },
    { $parentName: 'table-title-container', tagName: 'span', class: ['btn-ok'], role: 'button' },
    { parentId: params.contId, tagName: 'div', class: ['buttons-block'], $name: 'buttons-block' },

    addButtonSpec('editTableTitle', { id: params.contId }, 'Edit title'),
    addButtonSpec('addRow', { tableId }, 'Add row'),
    addButtonSpec('addColumn', { tableId }, 'Add column'),
    addButtonSpec('changeColumnsWidth', { tableId, type: 'increase' }, 'Increase'),
    addButtonSpec('changeColumnsWidth', { tableId, type: 'decrease' }, 'Decrease'),
    addButtonSpec('resetStyles', { tableId }, 'Reset styles'),
    addButtonSpec('collectTableDataAndSave', { tableId }, 'Save', ['btn-save']),
    addButtonSpec('confirmDeletingTable', { tableId }, 'Delete', ['btn-delete']),

    { parentId: params.contId, tagName: 'div', class: ['panels-block'], $name: 'panels-block' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'left-panel'] },
    { $parentName: 'panels-block', tagName: 'section', class: ['table-panel'], $name: 'table-panel' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'right-panel'] },
    { $parentName: 'table-panel', tagName: 'span', class: ['btn-close'],
      role: 'button', title: 'Close table', onClick: { funcName: 'closeTable', funcArgs: [{ tableId }] },
    },
  ];

  buildDOM(params);

  // rowsQty config spec is used in addColumn in the beginning of new table building
  if (!tablesConfig.getConfigItem('rowsQty')) tablesConfig.addToConfig({ rowsQty: 3 });
  if (!tablesConfig.getConfigItem('colsQty')) tablesConfig.addToConfig({ colsQty: 3 });

  const tableInitParams = {
    parentSelector: `#${params.contId} .table-panel`,
    contId: tableId,
  };

  if (tableData) {
    tableInitParams.colsQty = tableData.theadRow.length;
    createTable(tableInitParams, tableData);

  } else {
    tableInitParams.colsQty = tablesConfig.getConfigItem('colsQty');
    createTableTemplate(tableInitParams);
  }
}

export default createTableContainer;
