const body = document.querySelector('body');

/**
 * makeElem
 */
function makeElem(id) {
  const lib = {
    add: (parentId, tagName, newId) => {
      const newElem = document.createElement(tagName);
      if (newId) newElem.setAttribute('id', newId);
      if (tagName === 'table') newElem.classList.add('pristine');
      document.getElementById(parentId).appendChild(newElem);
    },
    addExisting: (parentId, childId) => {
      document.getElementById(parentId).appendChild(document.getElementById(childId));
    },
    addClass: (id, classNames) => {
      classNames.forEach(className => { document.getElementById(id).classList.add(className); });
    },
    addText: (id, text) => {
      document.getElementById(id).appendChild(document.createTextNode(text));
    },
    addTextRow(ids, textRow) {
      ids.forEach((id, idx) => {
        const columnId = this.columnsIds[`col${idx}`];
        document.getElementById(id).appendChild(document.createTextNode(textRow[columnId]));
      });
    },
    addLink: (id, linkData) => {
      const elem = document.getElementById(id);
      elem.setAttribute(linkData.href ? 'href' : 'src', linkData.href && (linkData.href.slice(0, 4) === 'http' ? linkData.href : `img/${linkData.href}`) || linkData.src);
      if (linkData.href) elem.setAttribute('target', linkData.target || '_blank');
      elem.appendChild(document.createTextNode(linkData.text));
    },
    addStyle: (id, styleData) => {
      styleData.forEach(entry => { document.getElementById(id).style[entry[0]] = entry[1]; });
    },
    addDataset(id) {
      document.getElementById(id).dataset[this.columnsIds[`col${id.slice(id.search(/[0-9]+$/))}`]] = '';
    },
    addOnClick(id, onClickData) {
      const elem = document.getElementById(id);
      const params = { dom: this, eventType: 'click' };
      if (onClickData.hasOwnProperty('funcArgs')) params.args = onClickData.funcArgs;
      const call = () => { funcLib[onClickData.funcName](elem, params); };
      elem.addEventListener('click', call);
    },
    addOnHover(id, onHoverData) {
      const elem = document.getElementById(id);
      const params = { dom: this, eventType: 'hover' };
      if (onHoverData.hasOwnProperty('funcArgs')) params.args = onHoverData.funcArgs;
      const call = () => { funcLib[onHoverData.funcName](elem, params); };
      elem.addEventListener('mouseover', call);
    },
    hangOnElem: (id, param) => {
      const keys = ['class', 'text', 'link', 'style', 'dataset', 'onClick', 'onHover'];
      keys.forEach(key => { if (param[key]) lib[`add${key[0].toUpperCase() + key.slice(1)}`](id, param[key]); });
    },
    pickElem: id => document.getElementById(id),
    collectColumnsIds(ids) {
      const columnsIds = {}, columnsIndexes = {};
      ids.forEach((id, idx) => { columnsIds[`col${idx}`] = `${id}`; columnsIndexes[id] = idx; });
      this.columnsIds = columnsIds;
      this.columnsIndexes = columnsIndexes;
    },
    collectCellsVals() {
      const tb = document.getElementById('tbody');
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
            columnsData.find(col => col.id === columnId).vals.push({ cellDate: cell.textContent, charCellDate: monthChars[cell.textContent.slice(-2)] + cell.textContent, id: cell.id });
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
    const root = document.createElement('div');
    root.setAttribute('id', id.slice(5));
    body.appendChild(root);
  }

  return lib;
}

/**
 * makeTable
 */
function makeTable(data) {
  const dom = makeElem(`:root${data.contId}`);

  data.elems.forEach(spec => {
    if (!spec.multiple) {
      const elemNewId = spec.newId || spec.tagName;
      dom.add(spec.parentId || data.contId, spec.tagName, elemNewId);
      dom.hangOnElem(elemNewId, spec);

    } else {
      const qty = typeof spec.multiple.qty === 'string' ? data[spec.multiple.qty] : spec.multiple.qty;

      for (let i = 0; i < qty; i++) {
        if (spec.multiple.columnsIds) dom.collectColumnsIds(spec.multiple.newIds);

        const columnsSpec = spec.multiple.hasOwnProperty('columnsIds') && spec.multiple.columnsIds;
        const createdId = `${spec.newId || spec.multiple.newIds[i] || spec.tagName}${columnsSpec ? '' : i}`;
        dom.add(spec.parentId || data.contId, spec.tagName, createdId);
        dom.hangOnElem(createdId, spec);

        const parentId = `${spec.newId || spec.multiple.newIds[i] || spec.tagName}`;
        if (spec.multiple.nested) {
          const nestedIds = [];
          const nested = spec.multiple.nested;
          const qty = typeof nested.multiple.qty === 'string' ? data[nested.multiple.qty] : nested.multiple.qty;
          const qtyOrig = qty;
          for (let y = 0; y < qty; y++) {
            const createdNestedId = !nested.newId ? `${parentId}${i}${nested.tagName}${y}` :
              Array.isArray(nested.newId) ? `${nested.newId[0] || parentId}${i}${nested.newId[1] || nested.tagName}${y}` :
                `${parentId}${i}${nested.newId}${y}`;
            dom.add(`${parentId}${i}`, nested.tagName, createdNestedId);
            dom.hangOnElem(createdNestedId, nested);
            nestedIds.push(createdNestedId);

            if (y === qty - 1 && nested.textRows[i]) dom.addTextRow(nestedIds, nested.textRows[i]);
          }
        }
        dom.addExisting(spec.parentId || data.contId, `${parentId}${columnsSpec ? '' : i}`);

        if (i === qty - 1 && spec.multiple.textRow) dom.addTextRow(spec.multiple.newIds, spec.multiple.textRow);
      }

    }
  });

  dom.collectCellsVals();

  sessionStorage.setItem('page_v1', body.children[body.children.length - 1].outerHTML);
  sessionStorage.setItem('params_v1', JSON.stringify(params));
}
