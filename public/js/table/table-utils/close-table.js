import { shownTables, sortColumnStyles } from '../state-collectors/index.js';
import { removeRules } from './modifiers/highlight-column.js';

/**
 * Close whole table container including title and buttons-block.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
function closeTable(btn, { tableId }) {
  const table = pickElem(tableId);

  if (table) {
    const hyphenId = table.dataset.hyphenId;
    shownTables.remove(hyphenId);

    const sortColumnStyleSheet = sortColumnStyles.getStyleSheet(hyphenId);

    if (sortColumnStyleSheet) removeRules(sortColumnStyleSheet);
  }
}

export default closeTable;
