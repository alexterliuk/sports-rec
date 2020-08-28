import { funcLib } from './build-dom.js';
import createArbitraryString from '../utils/create-arbitrary-string.js';
import { shownTables } from './state-collectors/index.js';

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
    addAndGet(newId, { parentId, parentSelector, tagName, $name, $parentName, parentElement }) {
      if (!tagName) return;

      const newElem = document.createElement(tagName);

      if (tagName === 'table') newElem.classList.add('pristine');
      if (newId) newElem.setAttribute('id', newId);
      if ($name) this.elementsBy$name[$name] = newElem;

      if (parentId) {
        pickElem(parentId).append(newElem);

      } else if (parentSelector) {
        querySel(parentSelector).append(newElem);

      } else if ($parentName) {
        this.elementsBy$name[$parentName].append(newElem);

      } else if (parentElement instanceof HTMLElement) {
        parentElement.append(newElem);

      } else {
        throw new Error('No parentId, parentSelector or $parentName is provided. Created element nowhere to append.');
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
      for (const st of styleData) {
        if (Array.isArray(st)) {
          elem.style[st[0]] = st[1];

        } else if (typeof st === 'object' && st.name && st.value) {
          elem.style[st.name] = st.value;
        }
      }
    },

    addRole(elem, roleName) {
      elem.setAttribute('role', roleName);
    },

    addTabindex(elem, index) {
      elem.setAttribute('tabindex', index);
    },

    addTitle(elem, title) {
      elem.setAttribute('title', title);
    },

    addDataset(elem, datasetItems) {
      if (!Array.isArray(datasetItems)) return;

      datasetItems.forEach(item => {
        if (!item.key) return;
        elem.dataset[item.key] = item.value;
      })
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
      const keys = ['class', 'text', 'link', 'style', 'role', 'tabindex', 'dataset', 'onHover', 'title'];
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

    collectCellsVals(hyphenId) {
      const tbody = querySel(`#${this.root.elementId} tbody`);
      const theadRow = querySel(`#${this.root.elementId} thead tr`);
      const columnsIds = Array.prototype.map.call(theadRow.children, child => child.id);
      const columnsData = columnsIds.map(id => ({ id, vals: [] }));

      for (const row of tbody.childNodes) {
        for (const cell of row.cells) {
          const textarea = querySel(`#${cell.id} textarea`);
          columnsData[cell.cellIndex].vals.push(textarea.value);
        }
      }

      shownTables.addToTable(hyphenId, { columnsData }, true);
    },

    createHyphenId(storedHyphenIds) {
      let hyphenIds = [];
      for (const table of querySelAll('* table')) {
        hyphenIds = hyphenIds.concat(table.dataset.hyphenId || [])
          .concat(storedHyphenIds || []);
      }

      const makeHyphenId = () => '-' + createArbitraryString(3).toLowerCase();

      let newHyphenId = makeHyphenId();
      let stop = 0;
      while (hyphenIds.includes(newHyphenId)) {
        newHyphenId = makeHyphenId();
        if (++stop === 1000) break;
      }

      return newHyphenId;
    },
  };

  const init = id && id.slice(0, 5) === ':root' && id.slice(5);
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
      element.dataset.hyphenId = options.hyphenId || lib.createHyphenId();
      lib.root.hyphenId = element.dataset.hyphenId;
      lib.root.tableTitle = querySel(`#${elementId.slice(0, -5)} .table-title`).textContent;
      lib.root.classNames = options.class || [];

      shownTables.add(lib.root.hyphenId, lib);
    }
  }

  lib.elementsBy$name = {};

  return lib;
}

export default getBuildDOMLibrary;
