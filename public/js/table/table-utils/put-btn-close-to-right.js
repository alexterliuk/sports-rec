/**
 * Make sure .btn-close is always on visible part of page (table's right upper corner) no matter how big is table.
 * @param {HTMLTableElement} table
 */
function putBtnCloseToRight(table) {
  const tables = table instanceof HTMLTableElement && [table] || querySelAll('table');

  for (const table of tables) {
    const tablePanel = table.parentElement;
    const theadRow = table.children[0].children[0];
    const btnClose = table.previousElementSibling;
    const bodyWidth = querySel('body').clientWidth;

    const leftSide = table.parentElement.previousElementSibling;
    const rightSide = table.parentElement.nextElementSibling;
    const padLeftRight = 2 * parsedCssVars.find(v => v.varKey === '--mtb-pad-hori').vals[1].px;
    const left = leftSide && leftSide.getBoundingClientRect().width || padLeftRight;
    const right = rightSide && rightSide.getBoundingClientRect().width || padLeftRight;

    // scrolling comes to effect
    const tableIsBigger = theadRow.clientWidth >= bodyWidth - left - right;

    const rightSideWidth = bodyWidth - tablePanel.getBoundingClientRect().right;
    btnClose.style.right = tableIsBigger ? `${rightSideWidth}px` : '';
    tablePanel.style.position = tableIsBigger ? 'initial' : '';
  }
}

export default putBtnCloseToRight;
