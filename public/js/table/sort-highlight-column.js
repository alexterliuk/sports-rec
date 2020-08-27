import sort from './sort.js';
import { tablesConfig } from './state-collectors/index.js';

const tableData = {};
const defaultColors = { click: '#576879', hover: '#6d8298' };

/**
 * Prepare data for sorting and invoke sort.
 * @param {HTMLElement} sortingBtn
 * @param {object} params
 */
function sortColumn(sortingBtn, params) {
  const dom = params.dom;
  const column = sortingBtn.parentElement.parentElement;

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
      highlightColumn(column, { dom, eventType: 'click' });
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

  if (!dom.columnsStyle) {
    dom.columnsStyle = {
      clickColor: tablesConfig.getConfigItem('clickColor') || defaultColors.click,
      hoverColor: tablesConfig.getConfigItem('hoverColor') || defaultColors.hover,
    };
  }

  if (params.eventType === 'hover') {
    addRules(sheetHover, dom.columnsStyle.hoverColor);
    column.addEventListener('mouseout', unhighlight);

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
        decl: `background-color: ${getLighterColor(color, 0.9)};`,
      },
      {
        name: 'td',
        sel: `#${dom.root.tableId} tr:nth-child(even) td:nth-child(${column.cellIndex + 1})`,
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
