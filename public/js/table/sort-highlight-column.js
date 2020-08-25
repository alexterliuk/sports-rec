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
      //highlightColumn(column, { dom, clickStyle, eventType: 'click' });
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

/**
 * highlightColumn
 */
function highlightColumn(column, params) {
  const dom = params.dom;
  dom.columnsStyle = dom.columnsStyle || {};
  dom.columnsStyle.click = dom.columnsStyle.click || params.clickStyle;
  dom.columnsStyle.hover = dom.columnsStyle.hover || Array.isArray(params.args) && params.args[0] || 'background-color: rgba(204, 222, 239, .2)';

  if (params.eventType === 'hover') {
    document.styleSheets[0].insertRule(`td[data-${column.id}] { ${dom.columnsStyle.hover} }`);
    column.addEventListener('mouseout', unhighlight);
  } else { // click
    unhighlight();
    document.styleSheets[0].insertRule(`td[data-${column.id}] { ${dom.columnsStyle.click} }`, document.styleSheets[0].rules.length);
    document.styleSheets[0].insertRule(`th#${column.id} { background-color: rgba(0, 0, 0, .1) }`, document.styleSheets[0].rules.length);
  }

  function unhighlight() {
    if (params.eventType === 'hover') {
      column.removeEventListener('mouseout', unhighlight);
      document.styleSheets[0].deleteRule(0);
    } else { // click
      document.styleSheets[0].deleteRule(document.styleSheets[0].rules.length - 1);
      document.styleSheets[0].deleteRule(document.styleSheets[0].rules.length - 1);
    }
  }
}

export { sortColumn, highlightColumn };
