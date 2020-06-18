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
  const { textarea } = addTextareaAndHider(cell);

  if (row.children.length > 1) {
    const rowDefaultHeight = parsedCssVars.find(parsed => parsed.varKey === '--rowDefaultHeight').vals[0].px;
    const rowActualHeight = row.getBoundingClientRect().height;

    if (rowActualHeight > rowDefaultHeight + 1) { // +1 to cover Firefox getBoundingClientRect's float number output (Chrome outputs integer)
      cell.style.height = row.children[row.children.length - 2].style.height;
      textarea.style.height = querySel(`#${row.children[row.children.length - 2].id} textarea`).style.height;
    }
  }

  enactShowHideResizer(textarea);
  listener.observe(textarea, { attributeFilter: ['style'] });

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
 * Add editing block to element.
 * @param elem {HTMLTableDataCellElement | HTMLTableHeaderCellElement}
 */
function addTextareaAndHider(elem) {
  const textarea = document.createElement('textarea');
  elem.append(textarea);
  const resizerHider = document.createElement('span');
  resizerHider.classList.add('resizer-hider');
  elem.append(resizerHider);

  return { textarea, resizerHider };
}

/**
 *
 */
function createEditMask() {
  const editMask = document.createElement('span');
  editMask.classList.add('edit-mask');

  return editMask;
}

/**
 *
 */
function createEditButton() {
  const editBtn = document.createElement('span');
  editBtn.classList.add('edit-button');
  editBtn.setAttribute('title', 'Edit column title');
  editBtn.setAttribute('role', 'button');
  editBtn.textContent = 'e';
  editBtn.addEventListener('click', event => {
    const th = event.target.parentElement;
    const editMask = querySel(`#${th.id} .edit-mask`);
    const textarea = querySel(`#${th.id} textarea`);

    if (editBtn.classList.value.includes('active')) {
      editBtn.classList.remove('active');
      editMask.style.display = 'initial';
      textarea.style.backgroundColor = '';
    } else {
      editBtn.classList.add('active');
      editMask.style.display = 'none';
      textarea.focus();
      textarea.style.backgroundColor = '#7593b1';
    }
  });

  return editBtn;
}

/**
 * Create a span for invoking sorting function.
 * @param {string} title
 * @param {function} callback
 * @returns {HTMLSpanElement}
 */
function createSortingButton(title, callback) {
  const sortingCont = document.createElement('span');
  sortingCont.classList.add('sorting-cont');
  const sortingBtn = document.createElement('span');
  sortingCont.append(sortingBtn);
  sortingBtn.setAttribute('title', title);
  sortingBtn.setAttribute('role', 'button');
  sortingBtn.classList.add('sorting-button');
  sortingBtn.addEventListener('click', callback);

  return sortingCont;
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

/**
 * Increase or decrease width of table columns.
 * @param btn {HTMLButtonElement}
 * @param tableId {string}
 * @param type {string} - 'increase' | 'decrease'
 */
function changeColumnsWidth(btn, { tableId, type }) {
  const table = pickElem(tableId);
  const regex = /wid-\d*/g;
  const tableClasses = table.classList.value.split(' ');

  for (const tableClass of tableClasses) {
    if (regex.test(tableClass)) {
      const num = +(tableClass.slice(4));

      if (type === 'increase' && num > 1 && num < 10) {
        table.classList.remove(tableClass);
        table.classList.add(`wid-${num + 1}`);
      }

      if (type === 'decrease' && num > 2 && num < 11) {
        table.classList.remove(tableClass);
        table.classList.add(`wid-${num - 1}`);
      }

      return;
    }
  }

  if (type === 'increase') table.classList.add('wid-3');
}
