import sort from './sort.js';

const tableData = {};

/**
 * Prepare data for sorting and invoke sort.
 * @param {HTMLElement} sortingBtn
 * @param {object} params
 */
function sortColumn(sortingBtn, params) {
  const dom = params.dom;
  const column = sortingBtn.parentElement.parentElement;

  const clickStyle = params.clickStyle || 'background-color: rgba(112, 128, 144, 0.08)';

  const table = querySel(`#${dom.root.tableId}`);
  const tbody = querySel(`#${dom.root.tableId} tbody`);
  const theadRow = querySel(`#${dom.root.tableId} thead tr`);

  let columnClass, prevSortedColumn;
  for (const th of theadRow.children) {
    if (th.id !== column.id) {
      for (const cl of th.classList) {
        if (cl === 'ascending' || cl === 'descending') prevSortedColumn = th;
      }
    } else {
      for (const cl of th.classList) {
        if (cl === 'ascending' || cl === 'descending') columnClass = cl;
      }
    }
  }

  if (columnClass) { // column is in sorted order (asc || desc)
    (dom.sortingMatrix || tableData.sortingMatrix).reverse();
    reorder(dom.sortingMatrix || tableData.sortingMatrix);
    column.classList.remove('ascending', 'descending');
    column.classList.add(columnClass === 'ascending' ? 'descending' : 'ascending');

  } else { // prepare dom.sortingMatrix to be passed into sort function
    dom.sortingMatrix = dom.columnsData.find(col => col.id === column.id).vals.map((val, idx) => {
      const item = { sortingColumn: column.id };
      item.cellVal = val;
      item.row = tbody.children[idx];
      item.cellsInRow = dom.columnsData.map(col => col.vals[idx]);

      return item;
    });
    tableData.sortingMatrix = dom.sortingMatrix;

    table.classList.remove('pristine');

    (sorted => {
      if (sorted.allValsEqual) return;
      if (prevSortedColumn) prevSortedColumn.classList.remove('ascending', 'descending');
      column.classList.add('descending'); // init order
      reorder(sorted);
      highlightColumn(column, { dom, clickStyle, eventType: 'click' });
    })(sort(dom.sortingMatrix, 'cellVal'));
  }

  /**
   * Reorder dom.sortingMatrix.
   * @param {array} sorted
   */
  function reorder(sorted) {
    sorted.forEach((item, rowIdx) => {
      tbody.appendChild(item.row);

      item.cellsInRow.forEach((cell, colIdx) => {
        dom.columnsData[colIdx].vals[rowIdx] = cell;
      });
    });
  }
}

// will hold highlighting columns styles
const sheetClick = new CSSStyleSheet();
const sheetHover = new CSSStyleSheet();
document.adoptedStyleSheets = [sheetClick, sheetHover];

/**
 * Add visual effect when hovering over column header, or when .sorting-btn clicked.
 * @param {HTMLElement} column - th
 * @param {object} params
 */
function highlightColumn(column, params) {
  const dom = params.dom;
  dom.columnsStyle = dom.columnsStyle || {};
  dom.columnsStyle.click = dom.columnsStyle.click || params.clickStyle;
  dom.columnsStyle.hover = dom.columnsStyle.hover || Array.isArray(params.args) && params.args[0] || 'background-color: rgba(204, 222, 239, .2)';

  if (params.eventType === 'hover') {
    if (!(column.classList.contains('ascending') || column.classList.contains('descending'))) {
      addRules(sheetHover, dom.columnsStyle.hoverColor);
      column.addEventListener('mouseout', unhighlight);
    }

  } else { // click
    unhighlight();
    addRules(sheetClick, dom.columnsStyle.clickColor, { th: '#mtb1Table ', td: 'table'});
  }

  /**
   * Add CSS rules to style sheet.
   * @param {CSSStyleSheet} sheet
   * @param {string} color
   * @param {object} [expandSelectors] - add additional selectors to win specificity over another styleSheet rules
   */
  function addRules(sheet, color, expandSelectors) {
    const rules = [
      {
        name: 'th',
        sel: `th#${column.id}`,
        decl: `background-color: ${color}; border-color: ${color};`,
      },
      {
        name: 'td',
        sel: `#${dom.root.tableId} td:nth-child(${column.cellIndex + 1})`,
        decl: `background-color: ${color};`,
      },
    ];

    rules.forEach(rule => {
      const expSel = (expandSelectors || {})[rule.name];
      const sel = `${expSel || ''}${rule.sel}`;
      sheet.insertRule(`${sel}, ${sel} .resizer-hider { ${rule.decl} }`, sheet.rules.length);
    });
  }

  /**
   * Remove CSS rules from style sheet.
   * @param {CSSStyleSheet} sheet
   */
  function removeRules(sheet) {
    sheet.deleteRule(sheet.rules.length - 1);
    sheet.deleteRule(sheet.rules.length - 1);
  }

  /**
   * Remove visual effects from column.
   */
  function unhighlight() {
    if (params.eventType === 'hover') {
      column.removeEventListener('mouseout', unhighlight);
      removeRules(sheetHover);

    } else if (sheetClick.rules.length) {
      removeRules(sheetClick);
    }
  }
}

export { sortColumn, highlightColumn };
