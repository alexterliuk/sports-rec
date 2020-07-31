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
 * Close whole table container including title and buttons-block.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
function closeTable(btn, { tableId }) {
  const table = pickElem(tableId);

  if (table) {
    shownTables.remove(table.dataset.hyphenId);
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
      dashboardDriver.updateDashboardInfo({ deletedTable: shownTables.get(hyphenId) });

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
      dashboardDriver.updateDashboardInfo({ newTable: _table });
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
      dashboardDriver.updateDashboardInfo({ deletedTable: _table });

    } else { // updated
      shownTables.addToTable(hyphenId, { tableTitle }, true);
      shownTables.addToTable(hyphenId, { theadRow }, true);
      shownTables.addToTable(hyphenId, { tbodyRows }, true);

      dashboardDriver.updateDashboardInfo({ updatedTable: _table });

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
 * Collect data from th or td tags.
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
