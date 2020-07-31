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
