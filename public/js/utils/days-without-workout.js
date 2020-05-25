/**
 * showDaysWithoutWorkout
 */
function showDaysWithoutWorkout(id) {
  const days = [];

  setTimeout(() => {
    const tbody = document.getElementById('tbody');

    if (tbody) {
      for (let i = 0, qtyOfRows = tbody.childElementCount; i < qtyOfRows; i++) {
        const row = tbody.children[i];
        const cells = [];

        for (let y = 0, qtyOfCells = row.childElementCount; y < qtyOfCells; y++) {
          if (row.children[y].textContent) cells.push(row.children[y].textContent);
        }

        if (cells.length === 1) days.push(cells[0]);
      }

      const elem = document.getElementById(id);
      if (elem) elem.textContent = `No workout (${days.length}) - ${days.join(', ')}.`;
    }
  }, 50);
}
