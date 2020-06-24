/**
 * Initialize MutationObserver of desired type and listen changes on node.
 * @param {string} type
 * @param {Node} node
 * @returns {object} - wrapper for MutationObserver.disconnect
 */
function watch(type, node) {
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

  const initializedMobs = _mobs[type]();
  initializedMobs.observe();

  return { disconnect: initializedMobs.disconnect };
}
