/**
 * Clear table from any style.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 */
function resetStyles(btn, { tableId } = {}) {
  if (tableId) {
    const table = pickElem(tableId);
    if (!table) return;

    clear(table, 5);
  }

  function clear(table, digToLevel) {
    table.style = '';

    let level = digToLevel || 1;
    let currElements = [table];
    let stop = 0;

    while (level--) {
      let newElements = [];
      currElements.forEach(elem => { clearChildrenOf(elem, newElements); });
      currElements = newElements;
      if (++stop === 1000) break;
    }

    function clearChildrenOf(node, arr) {
      for (const child of node.children) {
        child.style = '';
        arr.push(child);
      }
    }
  }
}

export default resetStyles;
