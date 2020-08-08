import { updateDashboardInfo } from '../../../dashboard/dashboard-driver.js';
import { removeEmptyColumns, removeLastEmptyRows } from '../modifiers/index.js';
import { collectRowsData, detectChanges } from './index.js';
import watch from '../../../utils/watch.js';
import isEmptyString from '../../../utils/is-empty-string.js';

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
      updateDashboardInfo({ newTable: _table });
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
      updateDashboardInfo({ deletedTable: _table });

    } else { // updated
      shownTables.addToTable(hyphenId, { tableTitle }, true);
      shownTables.addToTable(hyphenId, { theadRow }, true);
      shownTables.addToTable(hyphenId, { tbodyRows }, true);

      updateDashboardInfo({ updatedTable: _table });

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

export default collectTableDataAndSave;
