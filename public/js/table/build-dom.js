/**
 * Provider of library for building DOM elements.
 * @param {string} id - id of root element which will be created by buildDOM
 * @param {string} parentId - id of an element to which root element is appended
 * @returns {object} with functions
 */
function makeElem(id, parentId) {
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

      ids.forEach((id, idx) => {
        if (config.columnsIds || config.nested) {
          const columnId = this.columnsIds[`col${idx}`];
          pickElem(id).appendChild(document.createTextNode(textRow[columnId]));
        } else {
          const indexedId = !config.noIndexAtIdEnd && `${id}${idx}`;
          pickElem(indexedId || id).appendChild(document.createTextNode(textRow[id]));
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
      const params = { dom: this, eventType: 'click' };
      if (onClickData.hasOwnProperty('funcArgs')) params.args = onClickData.funcArgs;
      const call = () => { funcLib[onClickData.funcName](elem, params); };
      elem.addEventListener('click', call);
    },

    addOnHover(elem, onHoverData) {
      const params = { dom: this, eventType: 'hover' };
      if (onHoverData.hasOwnProperty('funcArgs')) params.args = onHoverData.funcArgs;
      const call = () => { funcLib[onHoverData.funcName](elem, params); };
      elem.addEventListener('mouseover', call);
    },

    hangOnElem: (elem, param) => {
      const keys = ['class', 'text', 'link', 'style', 'dataset', 'onClick', 'onHover'];
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
      const tb = querySel(`#${this.root.id} tbody`);
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
  };

  const init = id && id.slice(0, 5) === ':root';
  if (init) {
    lib.root = { id: id.slice(5) };
    lib.root.parent = typeof parentId === 'string' && pickElem(parentId) || querySel('body');
    const root = document.createElement('div');
    root.setAttribute('id', lib.root.id);
    lib.root.parent.appendChild(root);
    lib.elementsBy$name = {};
  }

  return lib;
}

/**
 * Creator of DOM parts within current body by using makeElem library.
 * @param data {object} - specs about what to build
 *        data.contId {string} - id of root element
 *        data.colsQty {number} - quantity of columns to build (for table)
 *        data.rowsQty {number} - quantity of rows to build (for table)
 *        data.elems {array} - comprises objects with specs for each element
 * Within single call of buildDOM might be created 0 or 1 table.
 */
function buildDOM(data) {
  const dom = makeElem(`:root${data.contId}`, data.parentId);

  data.elems.forEach(spec => {
    if (!spec.multiple) {
      const elemNewId = spec.newId;
      const newElem = dom.addAndGet(elemNewId, spec);
      dom.hangOnElem(newElem, spec);

    } else {
      const qty = typeof spec.multiple.qty === 'string' ? data[spec.multiple.qty] : spec.multiple.qty;

      for (let i = 0; i < qty; i++) {
        if (spec.multiple.columnsIds) dom.collectColumnsIds(spec.multiple.newIds);

        const columnsSpec = spec.multiple.hasOwnProperty('columnsIds') && spec.multiple.columnsIds;
        const noIndexAtIdEnd = spec.multiple.hasOwnProperty('noIndexAtIdEnd') && spec.multiple.noIndexAtIdEnd;

        const createdId = (() => {
          if (spec.newId || (spec.multiple.newIds || [])[i]) {
            return `${spec.newId || spec.multiple.newIds[i]}${(columnsSpec || noIndexAtIdEnd) ? '' : i}`;
          }
        })();

        const newElem = dom.addAndGet(createdId, spec);
        dom.hangOnElem(newElem, spec);

        const parentId = `${spec.newId || (spec.multiple.newIds || [])[i] || spec.tagName}`;

        if (spec.multiple.nested) {
          const nestedIds = [];
          const nested = spec.multiple.nested;
          const qty = typeof nested.multiple.qty === 'string' ? data[nested.multiple.qty] : nested.multiple.qty;
          const qtyOrig = qty;

          for (let y = 0; y < qty; y++) {
            const createdNestedId = !nested.newId ? `${parentId}${i}${nested.tagName}${y}` :
              Array.isArray(nested.newId) ? `${nested.newId[0] || parentId}${i}${nested.newId[1] || nested.tagName}${y}` :
                `${parentId}${i}${nested.newId}${y}`;

            const params = { parentId: `${parentId}${i}`, tagName: nested.tagName, $name: spec.$name, $parentName: spec.$parentName };
            const newElem = dom.addAndGet(createdNestedId, params);
            dom.hangOnElem(newElem, nested);
            nestedIds.push(createdNestedId);

            if (y === qty - 1 && nested.textRows[i]) dom.addTextRow(nestedIds, nested.textRows[i], { nested: true });
          }
        }

        const newElemOrId = (spec.multiple.newIds || spec.multiple.nested) ? `${parentId}${(columnsSpec || noIndexAtIdEnd) ? '' : i}` : newElem;
        dom.addExisting(spec.parentId || dom.elementsBy$name[spec.$parentName], newElemOrId);

        if (i === qty - 1 && spec.multiple.textRow) {
          dom.addTextRow(spec.multiple.newIds, spec.multiple.textRow, { columnsIds: columnsSpec, noIndexAtIdEnd });
        }
      }
    }
  });

  if (querySel(`#${dom.root.id} table`)) dom.collectCellsVals();

  sessionStorage.setItem('page_v1', querySel('body').children[1].outerHTML);
  sessionStorage.setItem('data_v1', JSON.stringify(data));
}
