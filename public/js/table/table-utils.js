/**
 * Switch on/off scrolling mode for .table-panel elements.
 * @param {object} nodeOrHTMLCollection
 */
function toggleScrollMode(nodeOrHTMLCollection) {
  const nodes = nodeOrHTMLCollection instanceof Node && [nodeOrHTMLCollection] || nodeOrHTMLCollection;

  for (const tablePanel of nodes) {
    if (tablePanel.clientWidth > window.outerWidth - 1) {
      tablePanel.style.overflowX = 'scroll';
    } else {
      tablePanel.style.overflowX = 'auto';
    }
  }
}

/**
 * Create empty cell.
 * @param {HTMLTableRowElement} row
 * @param {string} cellId
 * @returns {HTMLTableDataCellElement}
 */
function createCell(row, cellId) {
  const cell = row.insertCell();
  cell.setAttribute('id', cellId);
  const txtAr = document.createElement('textarea');
  cell.append(txtAr);
  const span = document.createElement('span');
  span.classList.add('resizer-hider');
  cell.append(span);

  if (row.children.length > 1) {
    const rowDefaultHeight = parsedCssVars.find(parsed => parsed.varKey === '--rowDefaultHeight').vals[0].px;
    const rowActualHeight = row.getBoundingClientRect().height;

    if (rowActualHeight > rowDefaultHeight + 1) { // +1 to cover Firefox getBoundingClientRect's float number output (Chrome outputs integer)
      cell.style.height = row.children[row.children.length - 2].style.height;
      txtAr.style.height = querySel(`#${row.children[row.children.length - 2].id} textarea`).style.height;
    }
  }

  enactShowHideResizer(txtAr);
  listener.observe(txtAr, { attributeFilter: ['style'] });

  return cell;
}
