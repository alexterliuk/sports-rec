import { shownTables, tablesConfig } from '../../state-collectors/index.js';

// will hold highlighting columns styles
const sheetClick = new CSSStyleSheet();
const sheetHover = new CSSStyleSheet();
document.adoptedStyleSheets = [sheetClick, sheetHover];

const clickColor = tablesConfig.getConfigItem('clickColor') || '#576879';
const hoverColor = tablesConfig.getConfigItem('hoverColor') || '#6d8298';

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

export default highlightColumn;
