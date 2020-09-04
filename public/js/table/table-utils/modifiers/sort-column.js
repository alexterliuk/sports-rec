import sort from '../../../utils/sort.js';
import isStringifiedNumber from '../../../utils/is-stringified-number.js';
import { shownTables } from '../../state-collectors/index.js';
import collectCellsVals from '../../table-utils/collect-cells-vals.js';
import { highlightColumn } from './highlight-column.js';

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

  // do not sort if only one row in table
  if (tbody.children.length === 1) return;

  const { sortingMatrix, notSortingMatrix, columnValsBeforeSorting } = makeMatrix(column);

  // do not sort if only one val in column and it's in first cell
  if ((columnValsBeforeSorting[0] || columnValsBeforeSorting[0] === 0) &&
       columnValsBeforeSorting.filter(v => v || v === 0).length === 1) return;

  let columnClass, prevSortedColumn;
  for (const th of theadRow.children) {
    for (const cl of th.classList) {
      if (cl === 'ascending' || cl === 'descending') {
        th.id !== column.id ? (prevSortedColumn = th) : (columnClass = cl);
      }
    }
  }

  table.classList.remove('pristine');

  (sorted => {
    if (sorted.allValsEqual) return;
    if (prevSortedColumn) prevSortedColumn.classList.remove('ascending', 'descending');
    column.classList.remove('ascending', 'descending');

    // if strings and numbers were sorted together, the sorting array has strings at the beginning and numbers - in the end;
    // normalize it (numbers first, then strings) by calling unifyValsByType;
    // if exclude this op, then if column was in desc order (default for sort function), after sorting it remains in the same state,
    // but we want to reverse column, so that user does not have a feeling of 'click - no visible action'
    const fullMatrix = sorted.concat(notSortingMatrix);
    const columnValsAfterSorting = unifyValsByType(getSortingVals(fullMatrix), true);

    const columnNotChanged = columnValsAfterSorting.every((v, idx) => v === columnValsBeforeSorting[idx]);

    if (columnNotChanged) {
      const asc = columnValsBeforeSorting[0] < columnValsBeforeSorting[1];
      column.classList.add(asc ? 'descending' : 'ascending');

    } else {
      column.classList.add((!columnClass || columnClass === 'ascending') ? 'descending' : 'ascending');
    }

    // avoid 'click - no action' feeling by reversing sorted part
    reorderTable(columnNotChanged ? sorted.reverse().concat(notSortingMatrix) : fullMatrix);

    highlightColumn(column, { eventType: 'click' });
  })(sort(sortingMatrix, 'cellVal', columnClass === 'descending')); // init sorting order - descending

  /**
   * Make matrix. Sorting part of it will be passed into sort function.
   * @param {HTMLElement} column - th
   * @returns {object}
   */
  function makeMatrix(column) {
    const colIdx = column.cellIndex;
    const sortingMatrix = [], notSortingMatrix = [], columnValsBeforeSorting = [];

    columnsData.find(col => col.id === column.id).vals.forEach((savedVal, idx) => {
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

      (item.cellVal || item.cellVal === 0) ? sortingMatrix.push(item) : notSortingMatrix.push(item);
      columnValsBeforeSorting.push(item.cellVal);
    });

    return { sortingMatrix, notSortingMatrix, columnValsBeforeSorting };
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
    normalizedSorted.forEach(item => tbody.append(item.row));
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
