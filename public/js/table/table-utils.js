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

/**
 * Display/hide textarea's resizer at right bottom corner.
 * @param {HTMLTextAreaElement} txtAr
 */
function enactShowHideResizer(txtAr) {
  txtAr.addEventListener('focus', () => { setDisplayTo('none'); });
  txtAr.addEventListener('blur', () => { setDisplayTo('initial'); });

  function setDisplayTo(val) {
    for (const child of txtAr.parentElement.children) {
      if (child.classList.value.includes('resizer-hider')) {
        child.style.display = val;
        break;
      }
    }
  }
}

/**
 * On resizing a textarea, make same height to all other textareas.
 * @param {HTMLTableCellElement} cell - <td>
 * @param {string} txtArHeight - e.g. '20px'
 */
function alignTextAreasHeight(cell, txtArHeight) {
  const row = cell.parentElement;
  const cellTextareaDiffHeight = parsedCssVars.find(parsed => parsed.varKey === '--cellTextareaDiffHeight').vals[0].px;

  for (const _cell of row.children) {
    _cell.style.height = `${parseInt(txtArHeight, 10) + cellTextareaDiffHeight}px`;

    for (const child of _cell.children) {
      if (_cell !== cell && child.tagName === 'TEXTAREA') {
        child.style.height = txtArHeight;
      }
    }
  }
}

/**
 * Create a span used as button for deleting row or column.
 * @param {string} title
 * @param {function} callback
 * @returns {HTMLSpanElement}
 */
function createDelStick(title, callback) {
  const delStick = document.createElement('span');
  delStick.classList.add('delete-stick');
  delStick.setAttribute('title', title);
  delStick.setAttribute('role', 'button');
  delStick.addEventListener('click', callback);

  return delStick;
}

/**
 * Initialize listener for textarea elements.
 * @type {MutationObserver}
 */
const listener = new MutationObserver(rec => {
  const touchedTxtAr = rec[0].target;
  const cell = touchedTxtAr.parentElement;
  const txtArHeight = touchedTxtAr.style.height;
  alignTextAreasHeight(cell, txtArHeight);
});
