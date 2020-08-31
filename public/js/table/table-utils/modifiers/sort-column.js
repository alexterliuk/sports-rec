import sort from '../../../utils/sort.js';
import isStringifiedNumber from '../../../utils/is-stringified-number.js';
import { shownTables } from '../../state-collectors/index.js';
import collectCellsVals from '../../table-utils/collect-cells-vals.js';
import highlightColumn from './highlight-column.js';

/**
 * Prepare data for sorting and invoke sort.
 * @param {HTMLElement} sortingBtn
 */
function sortColumn(sortingBtn) {
  const column = sortingBtn.parentElement.parentElement;
  const hyphenId = column.id.slice(-4);
  const currentTable = shownTables.get(hyphenId);
  const { tableId } = currentTable;

  const table = pickElem(tableId);
  const tbody = querySel(`#${tableId} tbody`);
  const theadRow = querySel(`#${tableId} thead tr`);

  const columnsData = collectCellsVals(tableId, tbody, theadRow);

  let columnClass, prevSortedColumn;
  for (const th of theadRow.children) {
    if (th.id !== column.id) {
      for (const cl of th.classList) {
        if (cl === 'ascending' || cl === 'descending') prevSortedColumn = th;
      }
    } else {
      for (const cl of th.classList) {
        if (cl === 'ascending' || cl === 'descending') columnClass = cl;
      }
    }
  }

  table.classList.remove('pristine');

  const sortingMatrix = makeSortingMatrix(column);
  const columnValsBeforeSorting = getSortingVals(sortingMatrix);

  (sorted => {
    if (sorted.allValsEqual) return;
    if (prevSortedColumn) prevSortedColumn.classList.remove('ascending', 'descending');
    column.classList.remove('ascending', 'descending');

    // if strings and numbers were sorted together, the sorting array has strings at the beginning and numbers - in the end;
    // normalize it (numbers first, then strings) by calling unifyValsByType;
    // if exclude this op, then if column was in desc order (default for sort function), it remains in the same state,
    // but we want to reverse column, so that user does not have a feeling of 'click - no visible action'
    const columnValsAfterSorting = unifyValsByType(getSortingVals(sorted), true);
    const columnNotChanged = columnValsAfterSorting.every((v, idx) => v === columnValsBeforeSorting[idx]);

    if (columnNotChanged) {
      const asc = columnValsBeforeSorting[0] < columnValsBeforeSorting[1];
      column.classList.add(asc ? 'descending' : 'ascending');

    } else {
      column.classList.add((!columnClass || columnClass === 'ascending') ? 'descending' : 'ascending');
    }

    reorderTable(columnNotChanged ? sorted.reverse() : sorted);

    highlightColumn(column, { eventType: 'click' });
  })(sort(sortingMatrix, 'cellVal', columnClass === 'descending')); // init sorting order - descending

  /**
   * Make sorting matrix to be passed into sort function.
   * @param {HTMLElement} column - th
   */
  function makeSortingMatrix(column) {
    const colIdx = column.cellIndex;

    return columnsData.find(col => col.id === column.id).vals.map((savedVal, idx) => {
      const item = { sortingColumn: column.id };
      const row = tbody.children[idx];
      const cell = row.children[colIdx];

      item.row = row;
      // for item.cellVal take current value from textarea instead of savedVal,
      // bec. textarea might have been edited and result not saved before clicking Sort column
      const textareaVal = querySel(`#${cell.id} textarea`).value;
      item.cellVal = textareaVal;
      if (isStringifiedNumber(textareaVal)) item.cellVal = parseFloat(textareaVal);

      item.cellsInRow = columnsData.map(col => col.vals[idx]);
      item.cellsInRow[colIdx] = item.cellVal;

      return item;
    });
  }

  /**
   * Get array with values of a single column.
   * @param {array} sortingMatrix
   */
  function getSortingVals(sortingMatrix) {
    return sortingMatrix.map(row => row.cellVal);
  }

  /**
   * Change order of rows in table according to sorted values.
   * @param {array} sorted - sortingMatrix
   */
  function reorderTable(sorted) {
    const normalizedSorted = unifyValsByType(sorted);

    normalizedSorted.forEach((item, rowIdx) => {
      tbody.append(item.row);

      item.cellsInRow.forEach((cell, colIdx) => {
        columnsData[colIdx].vals[rowIdx] = cell;
      });
    });
  }

  /**
   * Strings and numbers might have been sorted together in a column.
   * If so, unify values type by type (numbers first, then strings), add empty cells to column's end.
   * @param {array} sorted - sortingMatrix
   * @param {boolean} [arrOfPrimitives] - if true, sorted is array of primitives, otherwise - array of objects
   */
  function unifyValsByType(sorted, arrOfPrimitives) {
    const numbers = [], strings = [], empty = [];
    const getVal = v => arrOfPrimitives ? v : v.cellVal;

    sorted.forEach(v => {
      if (typeof getVal(v) === 'number') {
        numbers.push(v);

      } else { // string
        getVal(v) ? strings.push(v) : empty.push(v);
      }
    });

    return numbers.concat(strings).concat(empty);
  }
}

export default sortColumn;
