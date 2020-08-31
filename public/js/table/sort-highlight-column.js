import sort from './sort.js';
import { shownTables, tablesConfig } from './state-collectors/index.js';
import isStringifiedNumber from '../utils/is-stringified-number.js';
import collectCellsVals from './table-utils/collect-cells-vals.js';

const clickColor = tablesConfig.getConfigItem('clickColor') || '#576879';
const hoverColor = tablesConfig.getConfigItem('hoverColor') || '#6d8298';

/**
 * Prepare data for sorting and invoke sort.
 * @param {HTMLElement} sortingBtn
 */
function sortColumn(sortingBtn) {
  const column = sortingBtn.parentElement.parentElement;
  const hyphenId = column.id.slice(-4);
  const currentTable = shownTables.get(hyphenId);
  const { tableId } = currentTable;

  const table = pickElem(tableId);
  const tbody = querySel(`#${tableId} tbody`);
  const theadRow = querySel(`#${tableId} thead tr`);

  const columnsData = collectCellsVals(tableId, tbody, theadRow);

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

  table.classList.remove('pristine');

  const sortingMatrix = makeSortingMatrix(column);
  const columnValsBeforeSorting = getSortingVals(sortingMatrix);

  (sorted => {
    if (sorted.allValsEqual) return;
    if (prevSortedColumn) prevSortedColumn.classList.remove('ascending', 'descending');
    column.classList.remove('ascending', 'descending');

    const columnNotChanged = getSortingVals(sortingMatrix).every((v, idx) => v === columnValsBeforeSorting[idx]);

    if (columnNotChanged) {
      const asc = columnValsBeforeSorting[0] < columnValsBeforeSorting[1];
      column.classList.add(asc ? 'descending' : 'ascending');

    } else {
      column.classList.add((!columnClass || columnClass === 'ascending') ? 'descending' : 'ascending');
    }

    reorderTable(columnNotChanged ? sorted.reverse() : sorted);

    highlightColumn(column, { eventType: 'click' });
  })(sort(sortingMatrix, 'cellVal', columnClass === 'descending')); // init sorting order - descending

  /**
   * Make sorting matrix to be passed into sort function.
   * @param {HTMLElement} column - th
   */
  function makeSortingMatrix(column) {
    const colIdx = column.cellIndex;

    return columnsData.find(col => col.id === column.id).vals.map((savedVal, idx) => {
      const item = { sortingColumn: column.id };
      const row = tbody.children[idx];
      const cell = row.children[colIdx];

      item.row = row;
      // for item.cellVal take current value from textarea instead of savedVal,
      // bec. textarea might have been edited and result not saved before clicking Sort column
      const textareaVal = querySel(`#${cell.id} textarea`).value;
      item.cellVal = textareaVal;
      if (isStringifiedNumber(textareaVal)) item.cellVal = parseFloat(textareaVal);

      item.cellsInRow = columnsData.map(col => col.vals[idx]);
      item.cellsInRow[colIdx] = item.cellVal;

      return item;
    });
  }

  /**
   * Get array with values of a single column.
   * @param {array} sortingMatrix
   */
  function getSortingVals(sortingMatrix) {
    return sortingMatrix.map(row => row.cellVal);
  }

  /**
   * Change order of rows in table according to sorted values.
   * @param {array} sorted - sortingMatrix
   */
  function reorderTable(sorted) {
    const normalizedSorted = unifyValsByType(sorted);

    normalizedSorted.forEach((item, rowIdx) => {
      tbody.append(item.row);

      item.cellsInRow.forEach((cell, colIdx) => {
        columnsData[colIdx].vals[rowIdx] = cell;
      });
    });
  }

  /**
   * Strings and numbers might have been sorted together in a column.
   * If so, unify values type by type, add empty cells to column's end.
   * @param {array} sorted - sortingMatrix
   */
  function unifyValsByType(sorted) {
    const numbers = [], strings = [], empty = [];

    sorted.forEach(obj => {
      if (typeof obj.cellVal === 'number') {
        numbers.push(obj);

      } else {
        obj.cellVal ? strings.push(obj) : empty.push(obj);
      }
    });

    return numbers.concat(strings).concat(empty);
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
  const currentTable = shownTables.get(`${column.id.slice(-4)}`);
  const tableId = currentTable.tableId;

  if (params.eventType === 'hover') {
    addRules(sheetHover, hoverColor);
    column.addEventListener('mouseout', unhighlight);

  } else { // click
    unhighlight();
    addRules(sheetClick, clickColor, { th: `#${tableId} `, td: 'table'});
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
        sel: `#${tableId} td:nth-child(${column.cellIndex + 1})`,
        decl: `background-color: ${getLighterColor(color, 0.9)};`,
      },
      {
        name: 'td',
        sel: `#${tableId} tr:nth-child(even) td:nth-child(${column.cellIndex + 1})`,
        decl: `background-color: ${getLighterColor(color, 0.8)};`,
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
    let stop = 0;
    while (sheet.rules.length) {
      sheet.deleteRule(sheet.rules.length - 1);
      if (++stop === 1000) break;
    }
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

  /**
   * Make lighter color based on incoming color.
   * @param {string} color - rgb or hex
   * @param {number} grade - from 0 to 1
   */
  function getLighterColor(color, grade) {
    if (grade < 0 || grade > 1 || typeof color !== 'string') return color;

    const rgb = color[0] === '#' && hex2Rgb(color) || color;
    if (rgb.slice(0, 4) !== 'rgb(') return color;

    const split = rgb.split(/rgb\(|\)| /).slice(1, -1);
    const r = parseInt(split[0], 10);
    const g = parseInt(split[1], 10);
    const b = parseInt(split[2], 10);

    return 'rgb(' + [r, g, b].map(v => {
      return (255 - v) * grade + v;
    }).join(' ') + ')';
  }

  /**
   * If hex color, convert it to rgb
   * @param {string} color
   */
  function hex2Rgb(color) {
    if (typeof color !== 'string') return false;

    // cast to lowercase
    const lowColor = color.split('').map(c => c.toLowerCase()).join('').trim();

    const hex6Format = /#(\d|[a-f])(\d|[a-f])(\d|[a-f])(\d|[a-f])(\d|[a-f])(\d|[a-f])/g;
    const hex3Format = /#(\d|[a-f])(\d|[a-f])(\d|[a-f])/g;
    const hex3Color = lowColor.length === 4 && hex3Format.test(lowColor) && lowColor;
    const hex6Color = lowColor.length === 7 && hex6Format.test(lowColor) && lowColor;

    if (!hex3Color && !hex6Color) return false;

    const r = hex3Color && hex3Color[1] + hex3Color[1] || hex6Color.slice(1, 3);
    const g = hex3Color && hex3Color[2] + hex3Color[2] || hex6Color.slice(3, 5);
    const b = hex3Color && hex3Color[3] + hex3Color[3] || hex6Color.slice(5);

    return `rgb(${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)})`;
  }
}

export { sortColumn, highlightColumn };
