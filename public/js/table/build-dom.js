import getBuildDOMLibrary from './get-build-dom-library.js';
import collectTableDataAndSave from './table-utils/save-delete/collect-table-data-and-save.js';
import buildTables from './build-tables.js';
import { addColumn, deleteColumn } from './add-delete-column.js';
import { addRow, deleteRow} from './add-delete-row.js';

const funcLib = {
  editTableTitle,
  addRow,
  deleteRow,
  addColumn,
  deleteColumn,
  sortColumn,
  highlightColumn,
  changeColumnsWidth,
  resetStyles,
  collectTableDataAndSave,
  getUserTables,
  getTable,
  closeTable,
  buildTables,
  confirmDeletingTable,
};

/**
 * Creator of DOM parts within current body by using buildDOMLibrary.
 * @param data {object} - specs about what to build
 *        data.contId {string} - id of root element
 *        data.colsQty {number} - quantity of columns to build (for table)
 *        data.rowsQty {number} - quantity of rows to build (for table)
 *        data.elems {array} - comprises objects with specs for each element
 * Within single call of buildDOM might be created 0 or 1 table.
 * By calling buildDOM you create either table, or non-table DOM part, but not both at the same time.
 * This restriction derives from using hyphen-id (3 chars ending of id, e.g. '-qst').
 * Hyphen-id endings are added to all children of table which have id. This allows to have many tables on page.
 */
function buildDOM(data) {
  const dom = getBuildDOMLibrary(`:root${data.contId || ''}`, data);
  const hyphenId = (dom.root || {}).hyphenId;

  (data.elems || []).forEach(spec => {
    if (spec.builder) {
      const func = typeof funcLib[spec.builder.funcName] === 'function' && funcLib[spec.builder.funcName];
      const args = Array.isArray(spec.builder.funcArgs) && spec.builder.funcArgs[0];
      const callsQty = spec.builder.callsQty;

      if (!func) {
        console.error('Builder contents of', spec, 'is not valid. It must have funcName to get function by from funcLib.');
        return;
      }

      if (typeof callsQty === 'number' || !callsQty) {
        for (let i = 0; i < (callsQty || 1); i++) {
          func(null, args || {}, dom);
        }
      }

      if (data.tagName === 'table') {
        const table = dom.root.element;
        watch('pristine', table);
        watch('tableWidth', table);

        dom.root.theadRow = collectRowsData(table.children[0]);
        dom.root.tbodyRows = collectRowsData(table.children[1]);
      }

      return;
    }

    if (!spec.multiple) {
      const elemNewId = spec.newId && hyphenId ? `${spec.newId}${hyphenId}` : spec.newId;
      const newElem = dom.addAndGet(elemNewId, spec);
      dom.hangOnElem(newElem, spec);

    } else {
      const _hyphened = (hId => {
        const sm = spec.multiple;

        return hId && {
          newId: sm.newId && `${sm.newId}${hyphenId}`,
          multipleNewIds: sm.newIds && (sm.newIds || []).map(id => `${id}${hyphenId}`),
          parentId: sm.parentId && `${sm.parentId}${hyphenId}`,
          tagName: sm.tagName && `${sm.tagName}${hyphenId}`,
        };
      })(hyphenId);

      if (spec.multiple.columnsIds) dom.collectColumnsIds(_hyphened.multipleNewIds);

      const qty = typeof spec.multiple.qty === 'string' ? data[spec.multiple.qty] : spec.multiple.qty;

      for (let i = 0; i < qty; i++) {
        const columnsSpec = spec.multiple.hasOwnProperty('columnsIds') && spec.multiple.columnsIds;
        const noIndexAtIdEnd = spec.multiple.hasOwnProperty('noIndexAtIdEnd') && spec.multiple.noIndexAtIdEnd;

        const createdId = (() => {
          if (_hyphened.newId || spec.newId || (_hyphened.multipleNewIds || spec.multiple.newIds || [])[i]) {
            return `${_hyphened.newId || spec.newId || _hyphened.multipleNewIds[i] || spec.multiple.newIds[i]}${(columnsSpec || noIndexAtIdEnd) ? '' : i}`;
          }
        })();

        const newElem = dom.addAndGet(createdId, spec);
        dom.hangOnElem(newElem, spec);

        const parentId = `${_hyphened.newId || spec.newId || (_hyphened.multipleNewIds || spec.multiple.newIds || [])[i] || _hyphened.tagName || spec.tagName}`;

        if (spec.multiple.nested) {
          const nestedIds = [];
          const nestedSpec = spec.multiple.nested;
          const qty = typeof nestedSpec.multiple.qty === 'string' ? data[nestedSpec.multiple.qty] : nestedSpec.multiple.qty;

          for (let y = 0; y < qty; y++) {
            const createdNestedId = (hId => {
              if (!nestedSpec.newId) {
                return `${parentId}${i}${hId ? (nestedSpec.tagName + hyphenId) : nestedSpec.tagName}${y}`;

              } else if (Array.isArray(nestedSpec.newId)) {
                const newId0 = nestedSpec.newId[0] && (hId ? `${nestedSpec.newId[0]}${hyphenId}` : nestedSpec.newId[0]);
                const newId1 = nestedSpec.newId[1] && (hId ? `${nestedSpec.newId[1]}${hyphenId}` : nestedSpec.newId[1]);
                const tagName = hId ? `${nestedSpec.tagName}${hyphenId}` : nestedSpec.tagName;
                return `${newId0 || parentId}${i}${newId1 || tagName}${y}`;

              } else {
                return `${parentId}${i}${hId ? (nestedSpec.newId + hyphenId) : nestedSpec.newId}${y}`;
              }
            })(hyphenId);

            const params = { parentId: `${parentId}${i}`, tagName: nestedSpec.tagName, $name: spec.$name, $parentName: spec.$parentName };
            const newElem = dom.addAndGet(createdNestedId, params);
            dom.hangOnElem(newElem, nestedSpec);
            nestedIds.push(createdNestedId);

            if (y === qty - 1 && (nestedSpec.textRows || [])[i]) {
              dom.addTextRow(nestedIds, nestedSpec.textRows[i], { nested: true });
            }
          }
        }

        const newElemOrId = (_hyphened.multipleNewIds || spec.multiple.newIds || spec.multiple.nested) ? `${parentId}${(columnsSpec || noIndexAtIdEnd) ? '' : i}` : newElem;
        dom.addExisting(_hyphened.parentId || spec.parentId || dom.elementsBy$name[spec.$parentName], newElemOrId);

        if (i === qty - 1 && spec.multiple.textRow) {
          dom.addTextRow(_hyphened.multipleNewIds || spec.multiple.newIds, spec.multiple.textRow, { columnsIds: columnsSpec, noIndexAtIdEnd });
        }
      }
    }
  });

  //if (dom.root.element.tagName === 'TABLE') dom.collectCellsVals();

  sessionStorage.setItem('page_v1', querySel('body').children[1].outerHTML);
  sessionStorage.setItem('data_v1', JSON.stringify(data));
}

export { funcLib };
export default buildDOM;
