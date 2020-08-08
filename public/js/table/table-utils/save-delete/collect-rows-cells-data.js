/**
 * Collect data by calling collectCellsData once or multiple times.
 * @param {HTMLElement} tableChild - thead | tbody
 */
function collectRowsData(tableChild) {
  const tbodyRows = [];

  try {
    for (const row of tableChild.children) {
      if (tableChild.tagName === 'THEAD') return collectCellsData(row);

      if (tableChild.tagName === 'TBODY') {
        tbodyRows.push({
          id: row.id,
          cells: collectCellsData(row),
        });
      }
    }

    return tbodyRows;

  } catch (error) {
    throw error;
  }
}

/**
 * Collect data from th or td tags.
 * @param {HTMLTableRowElement} row
 * @returns {array}
 */
function collectCellsData(row) {
  const data = [];
  if (!row.children.length) return [];

  const tablePart = row.rowIndex ? 'tbody' : 'thead';

  for (const cell of row.children) {
    const { id } = cell;

    if (!id) {
      const info = `No id in cell ${cell.cellIndex} of ${tablePart} row${tablePart === 'thead' ? '' : ' ' + row.rowIndex}.`;
      throw new Error(info);
    }

    const classNames = (cell.classList.value && cell.classList.value.split(' ')) || [];
    const textarea = querySel(`#${cell.id} textarea`);
    const textareaValue = textarea.value;
    const textareaStyles = parseStyleAttr(textarea.outerHTML).filter(st => st.name !== 'margin' && st.name !== 'width');
    const styles = parseStyleAttr(cell.outerHTML);

    data.push({ id, classNames, styles, textareaValue, textareaStyles });
  }

  return data;
}

export default collectRowsData;
