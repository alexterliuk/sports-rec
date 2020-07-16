/**
 * Edit table title.
 * @param {HTMLButtonElement} btn
 * @param {string} id
 */
function editTableTitle(btn, { id }) {
  const title = querySel(`#${id} .table-title-container .table-title`);
  const input = querySel(`#${id} .table-title-container input`);
  const inputValueOrig = title.textContent || 'Table';
  const ok = querySel(`#${id} .table-title-container .btn-ok`);

  input.value = title.textContent;
  setDisplayTo('none', title);
  setDisplayTo('block', input, ok);

  ok.addEventListener('click', changeTitle);
  input.addEventListener('keydown', event => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      changeTitle();
    }
  });

  function setDisplayTo(type, ...elems) {
    for (const el of elems) el.style.display = type;
  }

  function changeTitle() {
    title.textContent = !isEmptyString(input.value) && input.value || inputValueOrig;
    setDisplayTo('none', input, ok);
    setDisplayTo('block', title);

    ok.removeEventListener('click', changeTitle);
    input.removeEventListener('keydown', changeTitle);
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
 * Wait a while, then remove table from mainTableBlock and dashboardInfo.
 * @param {string} hyphenId
 * @param {number} duration
 */
function removeTableFromPage(hyphenId, duration) {
  const dashboardInfo = pickElem('dashboardInfo');
  if (!dashboardInfo) return;

  const dashboardItem = (() => {
    let idx = dashboardInfo.children.length;
    while (idx) {
      const elem = dashboardInfo.children[--idx];
      if (elem.dataset.hyphenId === hyphenId) return elem;
    }
  })();

  visualizeThenRemove();

  // show/hide spinner, then remove elements
  function visualizeThenRemove() {
    const time = typeof duration === 'number' && duration || 3000;

    setTimeout(() => {
      dashboardInfo.classList.add('spinner');
    }, time);

    setTimeout(() => {
      if (dashboardItem) dashboardItem.remove();
      shownTables.remove(hyphenId);
      dashboardInfo.classList.remove('spinner');
      updateDashboardIndexes();
      shownTablesInDashboard.update();
    }, time + 500); // time to show/hide notify
  }
}

/**
 * Make correct positions for .dbo-items.
 */
function updateDashboardIndexes() {
  const dashboardInfo = pickElem('dashboardInfo');
  if (!dashboardInfo) return;

  let pos = dashboardInfo.children.length;
  while (--pos) {
    dashboardInfo.children[pos].children[0].textContent = pos;
  }
}

/**
 * Delete table if user confirms.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
async function confirmDeletingTable(btn, { tableId }) {
  if (!tableId) return;

  const confirmed = window.confirm('Are you sure to delete table?');
  if (confirmed) {
    btn.classList.add('no-click'); // avoid secondary click on Delete before table container is removed

    const tableElem = pickElem(tableId);
    const hyphenId = tableElem.dataset.hyphenId;

    const tableDeleted = await deleteTable(btn, { tableId, hyphenId });
    if (tableDeleted.deleted) {
      removeTableFromPage(hyphenId, 3000);

    } else {
      btn.classList.remove('no-click');
    }
  }
}

/**
 * Collect table data and invoke saveNewTable or updateTable function.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
async function collectTableDataAndSave(btn, { tableId }) {
  const tableElem = pickElem(tableId);
  const tableTitle = querySel(`#${tableId.slice(0, -5)} .table-title`).textContent;
  const hyphenId = tableElem.dataset.hyphenId;
  const classNames = (tableElem.classList.value && tableElem.classList.value.split(' ')) || [];

  let theadRow, tbodyRows;
  try {
    if (isEmptyString(tableTitle)) throw new Error('Table title is required.');
    theadRow = collectRowsData(tableElem.children[0]);
    tbodyRows = collectRowsData(tableElem.children[1]);

  } catch (error) {
    notify(tableId, error.message, 'error', 3000);
    return;
  }

  // _table comprises data collected from <table> just now before saving
  const _table = { tableTitle, hyphenId, tableId, classNames, theadRow, tbodyRows };

  // table is new
  if (!savedTablesHyphenIds.get().includes(hyphenId)) {
    shownTables.addToTable(hyphenId, { theadRow });
    shownTables.addToTable(hyphenId, { tbodyRows });
    _table.classNames = _table.classNames.filter(name => name !== 'pristine');

    const saved = await saveNewTable(btn, _table);
    if (saved) {
      savedTablesHyphenIds.replace();
      createDashboardItems([_table]);
      shownTablesInDashboard.update(_table);
      updateDashboardIndexes();
    }
    return;
  }

  // table comprises data used for creating <table> and its contents
  const table = shownTables.get(hyphenId);

  removeEmptyColumns(_table);
  removeLastEmptyRows(_table);

  // update shownTables if table has been updated
  // (only parts needed for future comparing of saved - not saved data in new updating cycle)
  // if table has been deleted (on attempt to save table with no text), remove it from shownTables
  const tableUpdated = await updateTableIfChanged();
  if (tableUpdated) {
    if (tableUpdated.deleted) {
      btn.classList.add('no-click'); // avoid secondary click on Save before table container is removed
      removeTableFromPage(hyphenId);

    } else { // updated
      shownTables.addToTable(hyphenId, { tableTitle }, true);
      shownTables.addToTable(hyphenId, { theadRow }, true);
      shownTables.addToTable(hyphenId, { tbodyRows }, true);
      tableElem.classList.add('pristine');
      watch('pristine', tableElem);
    }
  }

  /**
   * Invoke updateTable, if table or its title has been changed.
   */
  async function updateTableIfChanged() {
    let saved;

    if (!_table.classNames.find(name => name === 'pristine')) {
      saved = await updateTable(btn, _table);

    } else if (table.tableTitle !== tableTitle) {
      _table.classNames = _table.classNames.filter(name => name !== 'pristine');
      saved = await updateTable(btn, _table);

      // if text was changed by code (without click on textarea), .pristine class remains, so we need check for changes
    } else {
      const columnsNamesNotChanged = detectChanges(table.theadRow, theadRow, ['textareaValue']);
      const cellsTextNotChanged = detectChanges(table.tbodyRows, tbodyRows, ['textareaValue'], 'cells');

      if (columnsNamesNotChanged && cellsTextNotChanged) return;

      _table.classNames = _table.classNames.filter(name => name !== 'pristine');
      saved = await updateTable(btn, _table);
    }

    return saved;
  }
}

/**
 * Collect data by calling collectCellsData once or multiple times.
 * @param {HTMLElement} tableChild - thead | tbody
 */
function collectRowsData(tableChild) {
  const tbodyRows = [];

  try {
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

  } catch (error) {
    throw error;
  }
}

/**
 * Collect data from th or td tag.
 * @param {HTMLTableRowElement} row
 * @returns {array}
 */
function collectCellsData(row) {
  const data = [];
  if (!row.children.length) return [];

  const tablePart = row.rowIndex ? 'tbody' : 'thead';

  for (const cell of row.children) {
    const { id } = cell;

    if (!id) {
      const info = `No id in cell ${cell.cellIndex} of ${tablePart} row${tablePart === 'thead' ? '' : ' ' + row.rowIndex}.`;
      throw new Error(info);
    }

    const classNames = (cell.classList.value && cell.classList.value.split(' ')) || [];
    const textarea = querySel(`#${cell.id} textarea`);
    const textareaValue = textarea.value;
    const textareaStyles = parseStyleAttr(textarea.outerHTML).filter(st => st.name !== 'margin' && st.name !== 'width');
    const styles = parseStyleAttr(cell.outerHTML);

    data.push({ id, classNames, styles, textareaValue, textareaStyles });
  }

  return data;
}

/**
 * Return id from stored collection, or make default one and return.
 * @param {array} storedCellsIds
 * @param {HTMLTableRowElement} row
 * @param {number} index
 * @param {string} hyphenId
 */
function getStoredCellIdOrMakeNew(storedCellsIds, row, index, hyphenId) {
  const cellsIds = Array.isArray(storedCellsIds) && storedCellsIds;
  const cellsIdsInRow = cellsIds && Array.isArray(cellsIds[row.rowIndex - 1]) && cellsIds[row.rowIndex - 1] || [];

  return cellsIdsInRow[index] || 'td' + createArbitraryString(6) + hyphenId;
}

/**
 * Search and remove columns with no text.
 * @param {object} table
 */
function removeEmptyColumns(table) {
  const columnsWithoutText = [];
  table.theadRow.forEach((column, idx) => {
    if (!column.textareaValue.trim().length) {
      const columnCellsTexts = table.tbodyRows.map(row => row.cells[idx].textareaValue);
      const noTextInColumn = columnCellsTexts.every(text => !text.trim().length);

      if (noTextInColumn) columnsWithoutText.push({ colIndex: idx });
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
 * Remove empty rows if they are last in table.
 * @param {object} table
 */
function removeLastEmptyRows(table) {
  const isEmptyRow = row =>
    !row ? false : row.cells.every(cell => !cell.textareaValue.trim().length);

  while (isEmptyRow(table.tbodyRows[table.tbodyRows.length - 1])) {
    table.tbodyRows.pop();
  }
}

/**
 * Clear table from any style.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
function resetStyles(btn, { tableId } = {}) {
  if (tableId) {
    const table = pickElem(tableId);
    if (!table) return;

    clear(table, 5);
  }

  function clear(table, digToLevel) {
    table.style = '';

    let level = digToLevel || 1;
    let currElements = [table];
    let stop = 0;

    while (level--) {
      let newElements = [];
      currElements.forEach(elem => { clearChildrenOf(elem, newElements); });
      currElements = newElements;
      if (++stop === 1000) break;
    }

    function clearChildrenOf(node, arr) {
      for (const child of node.children) {
        child.style = '';
        arr.push(child);
      }
    }
  }
}

/**
 * Parse style attribute of html tag.
 * @param {string} htmlStr - outerHTML | innerHTML
 * @returns {array}
 */
function parseStyleAttr(htmlStr) {
  const _htmlStr = typeof htmlStr === 'string' && htmlStr || '';
  const firstTagOnlyStr = _htmlStr.slice(0, _htmlStr.search('>'));

  const stylesRawStr = firstTagOnlyStr.split('style="')[1];
  if (!stylesRawStr) return [];

  const styles = [];
  const stylesOnlyStr = stylesRawStr.slice(stylesRawStr.search(/\/\*|\w/), stylesRawStr.search('"')).trim();

  const stylesNotParsed = stylesOnlyStr.split(/;\*\/|; \*\/|;/);

  for (const style of stylesNotParsed) {
    if (style && !/\/\*\w|\/\* /g.test(style)) { // not commented style
      const split = style.split(':');
      const parsedStyle = {
        name: (n => n.slice(n.search(/\w/)))(split[0].trim()),
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
 * Check if objects' values are same by calling areObjectsEqualByKeysValues.
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
        const _equal = areObjectsEqualByKeysValues(keys, item, currD[idx]);
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
function areObjectsEqualByKeysValues(keys, ...objs) {
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
  const _getElem = tagName => document.createElement(tagName);
  const _ = { n: {} };

  _.n.notifyWrapper = _getElem('div');
  _.n.notifyWrapper.classList.add('notify-wrapper');

  _.n.notify = _getElem('div');
  _.n.notify.classList.add('notify', type);

  _.n.text = _getElem('span');
  _.n.text.textContent = message;

  _.n.btnCross = _getElem('span');
  _.n.btnCross.textContent = 'x';
  _.n.btnCross.classList.add('btn-cross');
  _.n.btnCross.addEventListener('click', () => {
    _.n.notifyWrapper.remove();
    delete _.n;
  });

  _.n.notify.append(_.n.text, _.n.btnCross);
  _.n.notifyWrapper.append(_.n.notify);

  // .panels-block
  pickElem(tableId).parentElement.parentElement.append(_.n.notifyWrapper);

  setTimeout(() => {
    if (_.n) {
      _.n.notify.style.backgroundColor = 'transparent';
      _.n.notify.style.borderColor = 'transparent';
      _.n.text.style.color = 'transparent';
      _.n.btnCross.style.backgroundColor = 'transparent';
      _.n.btnCross.style.color = 'transparent';

      setTimeout(() => {
        _.n.notifyWrapper.remove();
        delete _.n;
      }, 1000);
    }
  }, fadeAfter);
}
