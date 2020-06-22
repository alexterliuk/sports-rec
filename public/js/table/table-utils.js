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
 * Create cell.
 * @param {HTMLTableRowElement} row
 * @param {string} cellId
 * @param {string} textValue
 * @returns {HTMLTableDataCellElement}
 */
function createCell(row, cellId, textValue) {
  const cell = row.insertCell();
  cell.setAttribute('id', cellId);
  const { textarea } = addTextareaAndHider(cell);
  textarea.value = textValue || '';

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
 * @param {HTMLTableDataCellElement} cell - <td>
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
 * @param {HTMLTableDataCellElement | HTMLTableHeaderCellElement} elem
 * @returns {{ HTMLTextAreaElement, HTMLSpanElement }}
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
 * Create span to cover textarea so that it is not editable.
 * @returns {HTMLSpanElement}
 */
function createEditMask() {
  const editMask = document.createElement('span');
  editMask.classList.add('edit-mask');

  return editMask;
}

/**
 * Create button to turn on/off editing of column's title.
 * @returns {HTMLSpanElement}
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
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 * @param {string} type - 'increase' | 'decrease'
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

/**
 * Collect table data and invoke saveTable function.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
function collectTableDataAndSave(btn, { tableId }) {
  const tableElem = pickElem(tableId);
  const hyphenId = tableElem.dataset.hyphenId;
  const classNames = (tableElem.classList.value && tableElem.classList.value.split(' ')) || [];
  const theadRow = collectCellsData(tableElem.children[0].children[0]);

  const tbody = querySel(`#${tableId} tbody`);
  const tbodyRows = [];
  for (const row of tbody.children) {
    const _r = {};
    _r.id = row.id;
    _r.cells = collectCellsData(row);
    tbodyRows.push(_r);
  }

  const _table = { hyphenId, tableId, classNames, theadRow, tbodyRows};

  tables.addToTable(hyphenId, { _table }, true);
}

/**
 * Collect data from th or td tag.
 * @param {HTMLTableRowElement} row
 * @returns {array}
 */
function collectCellsData(row) {
  const data = [];
  if (!row.children.length) return [];

  for (const cell of row.children) {
    const { id } = cell;
    const classNames = (cell.classList.value && cell.classList.value.split(' ')) || [];
    const textarea = querySel(`#${cell.id} textarea`);
    const textareaValue = textarea.value;
    const textareaStyles = parseStyleAttr(textarea.outerHTML).filter(st => st.name === 'height');
    const styles = parseStyleAttr(cell.outerHTML);

    data.push({ id, classNames, styles, textareaValue, textareaStyles });
  }

  return data;
}

/**
 * Parse style attribute of html tag.
 * @param {string} htmlStr - outerHTML | innerHTML
 * @returns {array}
 */
function parseStyleAttr(htmlStr) {
  const firstTagOnlyStr = htmlStr.slice(0, htmlStr.search('>'));

  const stylesRawStr = firstTagOnlyStr.split('style="')[1];
  if (!stylesRawStr) return [];

  const styles = [];
  const stylesOnlyStr = stylesRawStr.slice(stylesRawStr.search(/\w/), stylesRawStr.search('"')).trim();

  let stylesNotParsed = stylesOnlyStr.split(';');

  for (const style of stylesNotParsed) {
    if (style) {
      const _st = style.trim();
      const split = _st.split(':');

      const parsedStyle = {
        name: split[0].trim(),
        value: (split[1] || '').trim(),
      };

      const styleNameSplit = parsedStyle.name.split('-');
      if (styleNameSplit[1]) {
        const camelCasedPart = styleNameSplit.slice(1).map(str => `${str[0].toUpperCase()}${str.slice(1)}`).join('');
        parsedStyle.name = styleNameSplit[0].concat(camelCasedPart);
      }

      styles.push(parsedStyle);
    }
  }

  return styles;
}
