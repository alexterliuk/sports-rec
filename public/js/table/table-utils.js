/**
 * Edit table title.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 */
function editTableTitle(btn, { id }) {
  const title = querySel(`#${id} .table-title-container .table-title`);
  const input = querySel(`#${id} .table-title-container input`);
  const ok = querySel(`#${id} .table-title-container .btn-ok`);

  input.value = title.textContent;
  setDisplayTo('none', title);
  setDisplayTo('block', input, ok);

  ok.addEventListener('click', changeTitle);

  function setDisplayTo(type, ...elems) {
    for (const el of elems) el.style.display = type;
  }

  function changeTitle() {
    title.textContent = input.value;
    setDisplayTo('none', input, ok);
    setDisplayTo('block', title);

    ok.removeEventListener('click', changeTitle);
  }
}

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
  watch('textareaHeight', textarea);

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
  const tableTitle = querySel(`#${tableId.slice(0, -5)} .table-title`).textContent;
  const hyphenId = tableElem.dataset.hyphenId;
  const classNames = (tableElem.classList.value && tableElem.classList.value.split(' ')) || [];
  const theadRow = collectRowsData(tableElem.children[0]);
  const tbodyRows = collectRowsData(tableElem.children[1]);

  // table comprises data used for creating <table> and its contents
  const table = tables.get(hyphenId);

  // _table has actual representation of table data before saving
  const _table = { tableTitle, hyphenId, tableId, classNames, theadRow, tbodyRows };

  tables.addToTable(hyphenId, { _table }, true);

  if (!_table.classNames.find(name => name === 'pristine')) {
    removeEmptyColumns(_table);
    saveTable(btn, _table);

  } else if (table.tableTitle !== tableTitle) {
    removeEmptyColumns(_table);
    _table.classNames = _table.classNames.filter(name => name !== 'pristine');
    saveTable(btn, _table);

  // if text was changed by code (without click on textarea), .pristine class remains, so we need check for changes
  } else {
    const columnsNamesNotChanged = detectChanges(table.theadRow, theadRow, ['textareaValue']);
    const cellsTextNotChanged = detectChanges(table.tbodyRows, tbodyRows, ['textareaValue'], 'cells');

    if (columnsNamesNotChanged && cellsTextNotChanged) return;

    removeEmptyColumns(_table);
    _table.classNames = _table.classNames.filter(name => name !== 'pristine');
    saveTable(btn, _table);
  }
}

/**
 * Collect data by calling collectCellsData once or multiple times.
 * @param {HTMLElement} tableChild - thead | tbody
 */
function collectRowsData(tableChild) {
  const tbodyRows = [];

  for (const row of tableChild.children) {
    if (tableChild.tagName === 'THEAD') return collectCellsData(row);

    if (tableChild.tagName === 'TBODY') {
      tbodyRows.push({
        id: row.id,
        cells: collectCellsData(row),
      });
    }
  }

  return tbodyRows;
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
 * Search and remove columns with no text.
 * @param {object} table
 */
function removeEmptyColumns(table) {
  const columnsWithoutText = [];
  table.theadRow.forEach((column, idx) => {
    if (!column.textareaValue) {
      const columnCellsTexts = table.tbodyRows.map(row => row.cells[idx].textareaValue);
      if (columnCellsTexts.every(val => !val)) {
        columnsWithoutText.push({ colIndex: idx });
      }
    }
  });

  for (const emptyColumn of columnsWithoutText) {
    table.theadRow[emptyColumn.colIndex] = false;
    table.tbodyRows.forEach(row => {
      row.cells[emptyColumn.colIndex] = false;
    });
  }

  table.theadRow = table.theadRow.filter(column => column);
  table.tbodyRows.forEach(row => {
    row.cells = row.cells.filter(cell => cell);
  });
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

/**
 * Check if objects' values are same by calling areObjectsEqualByKeys.
 * @param {object} oldData
 * @param {object} currData
 * @param {array} keys - strings
 * @param {string} arrKey - optional
 * @returns {boolean}
 */
function detectChanges(oldData, currData, keys, arrKey) {
  if (!arrKey) return _checkEquality(oldData, currData);

  if (typeof arrKey === 'string') {
    let idx = 0;

    for (const item of oldData) {
      const equal = _checkEquality(item[arrKey], currData[idx][arrKey]);
      if (!equal) return false;
      idx++;
    }

    return true;
  }

  function _checkEquality(oldD, currD) {
    if (Array.isArray(oldD) && Array.isArray(currD)) {
      let idx = 0;

      for (const item of oldD) {
        const _equal = areObjectsEqualByKeys(keys, item, currD[idx]);
        if (!_equal) return false;
        idx++;
      }

      return true;
    }
  }
}

/**
 * Check if objects have same values by keys.
 * @param {array} keys - what values to look at for comparing
 * @param {objects} objs
 */
function areObjectsEqualByKeys(keys, ...objs) {
  for (const key of keys) {
    if (typeof key !== 'string') return;

    let value = objs[0][key];

    for (const obj of objs) {
      if (value !== obj[key]) return false;
    }
  }
  return !keys.length ? undefined : true;
}

/**
 * Create and show notification within .table-panel.
 * @param {string} tableId
 * @param {string} message
 * @param {string} type - success | error
 * @param {number} fadeAfter
 */
function notify(tableId, message, type, fadeAfter) {
  const notifyWrapper = document.createElement('div');
  notifyWrapper.classList.add('notify-wrapper');

  const notify = document.createElement('div');
  notify.classList.add('notify', type);

  const text = document.createElement('span');
  text.textContent = message;

  const btnCross = document.createElement('span');
  btnCross.textContent = 'x';
  btnCross.classList.add('btn-cross');
  btnCross.addEventListener('click', event => {
    event.target.parentElement.style.display = 'none';
  });

  notify.append(text);
  notify.append(btnCross);
  notifyWrapper.append(notify);
  pickElem(tableId).parentElement.append(notifyWrapper);

  setTimeout(() => {
    notify.style.backgroundColor = 'transparent';
    notify.style.borderColor = 'transparent';
    text.style.color = 'transparent';
    btnCross.style.backgroundColor = 'transparent';
    btnCross.style.color = 'transparent';

    setTimeout(() => {
      notifyWrapper.remove();
    }, 1000);

  }, fadeAfter);
}
