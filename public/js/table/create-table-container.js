/**
 * Create page section with .table-title, .buttons-block and .panels-block where a table will reside.
 * @param {object} tableData
 */
function createTableContainer(tableData) {
  // Do not create a table which already exists on page.
  if (tableData && tables.get(tableData.hyphenId)) return;

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

  params.elems = [
    { parentId: params.contId, tagName: 'div', class: ['table-title-container'], $name: 'table-title-container' },
    { $parentName: 'table-title-container', tagName: 'h2', class: ['table-title'], text: `Table ${containerId}` },
    { $parentName: 'table-title-container', tagName: 'input' },
    { $parentName: 'table-title-container', tagName: 'span', class: ['btn-ok'], role: 'button' },
    { parentId: params.contId, tagName: 'div', class: ['buttons-block'], $name: 'buttons-block' },
    { $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName: 'editTableTitle', funcArgs: [{ id: params.contId }] },
      text: 'Edit title',
    },
    { $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName: 'addRow', funcArgs: [{ tableId }] },
      text: 'Add row',
    },
    { $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName: 'addColumn', funcArgs: [{ tableId }] },
      text: 'Add column',
    },
    { $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName: 'changeColumnsWidth', funcArgs: [{ tableId, type: 'increase' }] },
      text: 'Increase',
    },
    { $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName: 'changeColumnsWidth', funcArgs: [{ tableId, type: 'decrease' }] },
      text: 'Decrease',
    },
    { $parentName: 'buttons-block', tagName: 'button',
      onClick: { funcName: 'collectTableDataAndSave', funcArgs: [{ tableId }] },
      text: 'Save table',
      class: ['btn-save'],
    },
    { parentId: params.contId, tagName: 'div', class: ['panels-block'], $name: 'panels-block' },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'left-panel'] },
    { $parentName: 'panels-block', tagName: 'section', class: ['table-panel'] },
    { $parentName: 'panels-block', tagName: 'section', class: ['side-panel', 'right-panel'] },
  ];

  buildDOM(params);

  const configColsQty = tables.getConfigItem('colsQty') || (tables.addToConfig({ colsQty: 3 }), 3);

  // rowsQty config spec is used in addColumn in the beginning of new table building
  if (!tables.getConfigItem('rowsQty')) tables.addToConfig({ rowsQty: 3 });

  const tableInitParams = {
    parentSelector: `#${params.contId} .table-panel`,
    contId: tableId,
    colsQty: configColsQty,
  };

  createTableTemplate(tableInitParams);
}
