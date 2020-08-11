/**
 * Increase or decrease width of table columns.
 * @param {HTMLButtonElement} btn
 * @param {string} tableId
 * @param {string} type - 'increase' | 'decrease'
 */
function changeColumnsWidth(btn, { tableId, type }) {
  const table = pickElem(tableId);
  const regex = /wid-\d*/g;
  const tableClasses = table.classList.value.split(' ');

  for (const tableClass of tableClasses) {
    if (regex.test(tableClass)) {
      const num = +(tableClass.slice(4));

      if (type === 'increase' && num > 1 && num < 10) {
        table.classList.remove(tableClass);
        table.classList.add(`wid-${num + 1}`);
      }

      if (type === 'decrease' && num > 2 && num < 11) {
        table.classList.remove(tableClass);
        table.classList.add(`wid-${num - 1}`);
      }

      return;
    }
  }

  if (type === 'increase') table.classList.add('wid-3');
}

export default changeColumnsWidth;
