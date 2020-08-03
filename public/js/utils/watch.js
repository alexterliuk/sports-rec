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

  // detect changes in dashboardInfo.children.length
  _mobs.dashboardInfoLength = () => {
    const m = new MutationObserver(rec => {
      options.updateDashboard();
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
