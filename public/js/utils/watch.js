/**
 * Initialize MutationObserver of desired type and listen changes on node.
 * @param {string} type
 * @param {Node} node
 * @param {object} options
 * @returns {object} - wrapper for MutationObserver.disconnect
 */
function watch(type, node, { ...options } = {}) {
  const _mobs = {}; // wrapper for mutation observers

  // make all textareas within a row have equal height
  _mobs.textareaHeight = () => {
    const m = new MutationObserver(rec => {
      const touchedTxtAr = rec[0].target;
      const cell = touchedTxtAr.parentElement;
      const txtArHeight = touchedTxtAr.style.height;
      alignTextAreasHeight(cell, txtArHeight);
    });

    return {
      observe: () => {
        m.observe(node, { attributeFilter: ['style'] });
      },
      disconnect: () => {
        m.disconnect();
      },
    };
  };

  // detect changes in table (except textarea.value) and remove .pristine class
  _mobs.pristine = () => {
    const m = new MutationObserver(() => {
      if (node.classList.contains('pristine')) {
        node.classList.remove('pristine');
        m.disconnect();
      }
    });

    return {
      observe: () => {
        m.observe(node, { attributes: true, subtree: true, childList: true /*detects addition/removal of row | column*/ });
      },
      disconnect: () => {
        m.disconnect();
      },
    };
  };

  // if table overflows, attach .btn-close to .panels-block, so that it stays within page
  _mobs.tableWidth = () => {
    const m = new MutationObserver(rec => {
      let table = rec[0].target;

      let stop = 0;
      while (table.tagName !== 'TABLE') {
        table = table.parentElement;
        if (++stop === 1000) break;
      }

      putBtnCloseToRight(table);
    });

    return {
      observe: () => {
        m.observe(node, { attributes: true, subtree: true, childList: true });
      },
      disconnect: () => {
        m.disconnect();
      },
    };
  };

  // 1. remove a child of unexpected format from dashboardInfo
  // 2. if dashboardInfo's state is different from corresponding page in _data.pages, repack _data.pages
  // both cases may happen due to breaking of dashboardDriver's normal workflow (e.g. manual forced appending dboItem from another page)
  _mobs.dashboardInfoLength = () => {
    const m = new MutationObserver(rec => {
      // stop if previously called _mobs has not finished its job, or if dashboardInfo is being currently updated by normal workflow
      if (options.isDashboardInfoUpdating()) return;

      const dashboardInfo = pickElem('dashboardInfo');
      const currPageHyphenIdsInData = options.getCurrPageHyphenIds();
      const currPageHyphenIdsInInfo = [];
      const elemsToRemove = [];

      for (const elem of dashboardInfo.children) {
        if (!elem.classList.value.includes('dbo-head')) {
          const dboItemClass = elem.classList.value.includes('dbo-item');
          const dataHyphenId = elem.dataset.hyphenId !== undefined;

          // if elem doesn't meet prerequisites, remove it
          if (!(dboItemClass && dataHyphenId)) {
            elemsToRemove.push(elem);

          } else {
            currPageHyphenIdsInInfo.push(elem.dataset.hyphenId);
          }
        }
      }

      elemsToRemove.forEach(elem => { elem.remove(); });

      const hyphenIdsNotSame = currPageHyphenIdsInInfo.some((id, idx) => id !== currPageHyphenIdsInData[idx]);
      if (hyphenIdsNotSame) options.repackDashboardPages();
    });

    return {
      observe: () => {
        m.observe(node, { childList: true });
      },
      disconnect: () => {
        m.disconnect();
      },
    };
  };

  const initializedMobs = _mobs[type]();
  initializedMobs.observe();

  return { disconnect: initializedMobs.disconnect };
}

export default watch;
