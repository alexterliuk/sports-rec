const funcLib = {
  addRow,
  deleteRow,
  addColumn,
  deleteColumn,
  sortColumn,
  highlightColumn,
  changeColumnsWidth,
  collectTableDataAndSave,
  getUserTables,
  getTable,
};

/**
 * Collector of tables.
 * Each table is accessible by hyphenId (id ending which is unique for each table).
 */
const tables = (function() {
  const _config = {};
  const addToConfig = (...items) => {
    items.forEach(item => {
      const name = Object.keys(item)[0];
      _config[name] = item[name];
    });
  };
  const getConfigItem = name => _config[name];
  const getAllConfig = () => _config;

  const _tables = {};
  const add = (hyphenId, buildingDOMLibraryAndTable) => {
    if (!_tables.hasOwnProperty(hyphenId) && typeof (buildingDOMLibraryAndTable || {}).root === 'object') {
      _tables[hyphenId] = buildingDOMLibraryAndTable.root;
    }
  };
  const addToTable = (hyphenId, spec, override) => {
    const table = get(hyphenId);
    const specName = Object.keys(spec)[0];

    if (table) {
      if (override) {
        table[specName] = spec[specName];
      } else if (!table.hasOwnProperty(specName)) {
        table[specName] = spec[specName];
      }
    }
  };
  const get = hyphenId => _tables[hyphenId];
  const getAll = () => _tables;
  const remove = hyphenId => {
    const table = get(hyphenId);
    if (table) {
      pickElem(`${table.elementId.slice(0, -5)}`).remove();
      delete _tables[hyphenId];
    }
  };

  return { add, addToTable, get, getAll, remove, addToConfig, getConfigItem, getAllConfig };
})();

/**
 * Provider of library for building DOM elements.
 * @param {string} id - id of root element which will be created by buildDOM
 * @param {object} options:
 *         - parentId {string} - id of an element to which root element is appended
 *         - parentSelector {string} - selector to get an element to which root element is appended
 *         - tagName {string} - tag name of root element
 * @returns {object} with functions
 */
function getBuildDOMLibrary(id, options) {
  const lib = {
    addAndGet(newId, { parentId, tagName, $name, $parentName }) {
      const newElem = document.createElement(tagName);

      if (tagName === 'table') newElem.classList.add('pristine');
      if (newId) newElem.setAttribute('id', newId);
      if ($name) this.elementsBy$name[$name] = newElem;

      if (parentId) {
        pickElem(parentId).appendChild(newElem);
      } else if ($parentName) {
        this.elementsBy$name[$parentName].appendChild(newElem);
      } else {
        throw new Error('No parentId or $parentName is provided. Created element nowhere to append.');
      }

      return newElem;
    },

    addExisting(elemOrId, childOrId) {
      const elem   = typeof elemOrId !== 'string' && elemOrId;
      const elemId = typeof elemOrId === 'string' && elemOrId;
      const child   = typeof childOrId !== 'string' && childOrId;
      const childId = typeof childOrId === 'string' && childOrId;

      (elem || pickElem(elemId)).appendChild(child || pickElem(childId));
    },

    addClass(elem, classNames) {
      classNames.forEach(className => { elem.classList.add(className); });
    },

    addText(elem, text) {
      elem.appendChild(document.createTextNode(text));
    },

    addTextRow(ids, textRow, config) {
      if (!ids) throw new Error('No ids. Array with ids (option.multiple.newIds) must be specified for addTextRow.');
      const hyphenId = this.root.hyphenId;

      ids.forEach((id, idx) => {
        if (config.columnsIds || config.nested) {
          const columnId = this.columnsIds[`col${idx}`];
          pickElem(id).appendChild(document.createTextNode(textRow[hyphenId ? columnId.slice(0, -4) : columnId]));
        } else {
          const indexedId = !config.noIndexAtIdEnd && `${id}${idx}`;
          pickElem(indexedId || id).appendChild(document.createTextNode(textRow[hyphenId ? id.split('-')[0] : id]));
        }
      });
    },

    addLink(elem, linkData) {
      elem.setAttribute(linkData.href ? 'href' : 'src', linkData.href || linkData.src);
      if (linkData.href) elem.setAttribute('target', linkData.target || '_blank');
      elem.appendChild(document.createTextNode(linkData.text));
    },

    addStyle(elem, styleData) {
      styleData.forEach(entry => { elem.style[entry[0]] = entry[1]; });
    },

    addDataset(elem) {
      elem.dataset[this.columnsIds[`col${elem.id.slice(elem.id.search(/[0-9]+$/))}`]] = '';
    },

    addOnClick(elem, onClickData) {
      const params = { eventType: 'click' };
      const args = Array.isArray(onClickData.funcArgs) && onClickData.funcArgs[0];

      if (typeof args === 'object') {
        Object.keys(args).forEach(key => {
          if (!params.hasOwnProperty(key)) params[key] = args[key];
        });
      }
      const call = () => { funcLib[onClickData.funcName](elem, params); };
      elem.addEventListener('click', call);
    },

    addOnHover(elem, onHoverData) {
      const params = { dom: this, eventType: 'hover' };
      if (onHoverData.hasOwnProperty('funcArgs')) params.args = onHoverData.funcArgs;
      const call = () => { funcLib[onHoverData.funcName](elem, params); };
      elem.addEventListener('mouseover', call);
    },

    hangOnElem(elem, param) {
      const keys = ['class', 'text', 'link', 'style', 'dataset', 'onHover'];
      if (elem.tagName !== 'TH') keys.push('onClick');

      keys.forEach(key => {
        if (param[key]) {
          lib[`add${key[0].toUpperCase() + key.slice(1)}`](elem, param[key]);
        }
      });
    },

    collectColumnsIds(ids) {
      const columnsIds = {}, columnsIndexes = {};
      ids.forEach((id, idx) => {
        columnsIds[`col${idx}`] = `${id}`;
        columnsIndexes[id] = idx;
      });
      this.columnsIds = columnsIds;
      this.columnsIndexes = columnsIndexes;
    },

    collectCellsVals() {
      const tb = querySel(`#${this.root.elementId} tbody`);
      const columnsData = Object.entries(this.columnsIds).reduce((acc, curr) => { acc.push({ id: curr[1], vals: [] }); return acc; }, []);
      const monthChars = { '01': 'a', '02': 'b', '03': 'c', '04': 'd', '05': 'e', '06': 'f', '07': 'g', '08': 'h', '09': 'i', '10': 'j', '11': 'k', '12': 'l' };

      for (const row of tb.childNodes) {
        for (const cell of row.cells) {
          const columnId = this.columnsIds[`col${cell.cellIndex}`];

          if (cell.cellIndex) {
            const chunks = cell.textContent ? cell.textContent.split(': ') : 0;
            const sum = !cell.textContent ? 0 : (Number.isNaN(+chunks[0]) ? chunks[0].split(/\D/).reduce((acc, curr) => acc += +curr, 0) : +chunks[0]);
            const sets = !cell.textContent ? [0] : (chunks[1] || chunks[0]).split(/\D/).map(val => +val).filter(num => num);
            columnsData.find(col => col.id === columnId).vals.push({ sum, sets, id: cell.id });
          } else { // date
            columnsData.find(col => col.id === columnId).vals.push({
              cellDate: cell.textContent,
              charCellDate: monthChars[cell.textContent.slice(-2)] + cell.textContent,
              id: cell.id,
            });
          }
        }
      }
      this.columnsData = columnsData;

      const columnsDataJSON = JSON.stringify(columnsData);
      sessionStorage.setItem('columnsData', columnsDataJSON);
      sessionStorage.setItem('initColumnsData', columnsDataJSON);
    },

    createHyphenId(storedHyphenIds) {
      const alphabet = (alph => alph + alph + alph + alph)('abcdefghijklmnopqrstuvwxyz');

      let hyphenIds = [];
      for (const table of querySelAll('* table')) {
        hyphenIds = hyphenIds.concat(table.dataset.hyphenId || [])
                             .concat(storedHyphenIds || []);
      }

      const getRandomIndex = () => +`${('' + Math.random()).slice(-2)}`;
      const makeHyphenId = () => {
        let hyphenId = '-';
        for (let i = 0; i < 3; i++) {
          hyphenId += alphabet[getRandomIndex()];
        }
        return hyphenId;
      };

      let newHyphenId = makeHyphenId();
      let stop = 0;
      while (hyphenIds.includes(newHyphenId)) {
        newHyphenId = makeHyphenId();
        if (++stop === 1000) break;
      }

      return newHyphenId;
    },
  };

  const init = id && id.slice(0, 5) === ':root';
  if (init) {
    const { parentId, parentSelector, tagName, firstChild } = options;

    const elementId = id.slice(5);
    const element = document.createElement(typeof tagName === 'string' && tagName || 'div');
    const parent = pickElem(parentId) || querySel(parentSelector) || querySel('body');

    element.setAttribute('id', elementId);
    firstChild ? parent.prepend(element) : parent.append(element);
    lib.hangOnElem(element, options);

    lib.root = { elementId, element, parent };

    if (element.tagName === 'TABLE') {
      element.classList.add('pristine');
      element.dataset.hyphenId = lib.createHyphenId();
      lib.root.hyphenId = element.dataset.hyphenId;
      lib.root.tableTitle = querySel(`#${elementId.slice(0, -5)} .table-title`).textContent;
      tables.add(lib.root.hyphenId, lib);
    }

    lib.elementsBy$name = {};
  }

  return lib;
}

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
  const hyphenId = dom.root.hyphenId;

  data.elems.forEach(spec => {
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
        tables.addToTable(hyphenId, { tableOuterHTML: table.outerHTML }, true);
        watch('pristine', table);

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
