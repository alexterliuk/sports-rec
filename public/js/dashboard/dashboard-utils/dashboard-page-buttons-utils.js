/**
 * Create dashboard page number button's specification to be used in buildDOM.
 * @param {HTMLElement} parentElement
 * @param {number} pageNum
 */
function getPageButtonSpec({ parentElement, pageNum } = {}) {
  return {
    parentElement,
    tagName: 'span',
    role: 'button',
    tabindex: 1,
    dataset: [{ key: 'pageNum', value: pageNum ? pageNum : 0 }],
    text: pageNum ? `${pageNum}` : '',
  };
}

/**
 * Create dashboard page navigation button's specification to be used in buildDOM.
 * @param {string} id
 */
function getNavPageButtonSpec(id) {
  return (elem => {
    return {
      ...elem,
      parentId: 'dashboardPagination',
      newId: id,
      class: ['dbo-nav-page'],
      dataset: [{ key: 'pageNum', value: 0 }],
    };
  })(getPageButtonSpec());
}

/**
 * Replace prevPage and nextPage buttons with new versions of themselves but with triangle indicators.
 * @param {string} ids
 */
function updateNavPageButtons(...ids) {
  const _types = {
    prevPage: { indicator: '&ltrif;' },
    nextPage: { indicator: '&rtrif;' },
  };

  return ids.map(id => {
    if (_types[id]) {
      const elem = pickElem(id);
      elem.outerHTML = elem.outerHTML.replace('</', `${_types[id].indicator}</`);

      return pickElem(id); // replaced elem
    }
  });
}

/**
 * Add click event listeners to nodes.
 * @param {array} elems - nodes
 */
function addClickListeners(elems) {
  if (!Array.isArray(elems)) return elems;

  const _types = {
    prevPage: { functionName: prevFunc },
    nextPage: { functionName: nextFunc },
  };

  return elems.map(elem => {
    if (typeof elem === 'object' && Object.getPrototypeOf(elem).constructor.name === 'HTMLSpanElement') {
      if (_types[elem.id]) {
        elem.addEventListener('click', _types[elem.id].functionName);

        return elem;
      }
    }

    return elem;
  });
}
