/**
 * Start or finish waiting state to indicate client <-> server interaction.
 * @param {boolean} type
 * @param {string} tableId
 */
function setWaitingState(type, tableId) {
  const method = type ? 'add' : 'remove';
  const pageSegmentId = tableId.slice(0, -5);
  const tableTitle = querySel(`#${pageSegmentId} .table-title`);
  const buttonsBlock = querySel(`#${pageSegmentId} .buttons-block`);
  const panelsBlock = querySel(`#${pageSegmentId} .panels-block`);

  for (const elem of [tableTitle, { processChildren: buttonsBlock, spinner: buttonsBlock }, panelsBlock]) {
    if (!elem.processChildren) elem.classList[method]('semitransparent');

    if (elem.processChildren) {
      const parent = elem.processChildren;

      for (const child of parent.children) {
        child.classList[method]('semitransparent');
      }
    }

    if (elem.spinner) elem.spinner.classList[method]('spinner');
  }
}
