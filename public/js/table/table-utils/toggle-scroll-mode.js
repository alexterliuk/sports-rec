/**
 * Switch on/off scrolling mode for .table-panel elements.
 * @param {object} nodeOrHTMLCollection
 */
function toggleScrollMode(nodeOrHTMLCollection) {
  const nodes = nodeOrHTMLCollection instanceof Node && [nodeOrHTMLCollection] || nodeOrHTMLCollection;

  for (const tablePanel of nodes) {
    if (tablePanel.clientWidth > window.outerWidth - 1) {
      tablePanel.style.overflowX = 'scroll';
    } else {
      tablePanel.style.overflowX = 'auto';
    }
  }
}
