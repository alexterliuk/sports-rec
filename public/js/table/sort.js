/**
 * sort
 */
function sort(data, sortingKey) { // if sortingKey, data is array of objects, otherwise - data is array of numbers
  const sorted = [{ initData: data }];
  const key = (typeof sortingKey === 'number' || typeof sortingKey === 'string') && sortingKey;

  for (let i = 0; i <= data.length; i++) {
    if (!i) {
      _sort(sorted[i].initData, i);
    } else {
      if (sorted[i] && sorted[i].gte.length) _sort(sorted[i].gte, i);
      if (sorted[i] && sorted[i].lt.length) _sort(sorted[i].lt, i);
    }
  }

  return _build(sorted);

  function _build(sorted) {
    let finalSorted = [];
    let i = sorted.length - 1;

    // if all values in data are equal, do not build (sorted[1] instead of 0 - bec. at 0 is initData)
    if (sorted[1].eq && sorted[1].eq.length === data.length) return { allValsEqual: true };

    for (i; i >= 1; i -= 1) {
      if (i === sorted.length - 1) {
        finalSorted.push(sorted[i].pivot);
      } else {
        const idx = finalSorted.findIndex(el => i === 1 ?
          (key ? el[key] > sorted[i].pivot[key] : el > sorted[i].pivot) :
          (key ? el[key] >= sorted[i].pivot[key] : el >= sorted[i].pivot));

        if (idx === -1) {
          finalSorted = finalSorted.concat(sorted[i].eq /* i === 1 */ || sorted[i].pivot);
        } else if (!idx) {
          finalSorted = (sorted[i].eq /* i === 1 */ || [sorted[i].pivot]).concat(finalSorted);
        } else {
          finalSorted = finalSorted.slice(0, idx).concat(sorted[i].eq /* i === 1 */ || sorted[i].pivot).concat(finalSorted.slice(idx));
        }
      }
    }

    finalSorted.forEach((val, idx) => { data[idx] = val; });

    return data.reverse(); // init order desc
  }

  function _sort(arr, level) {
    let pivot = arr[arr.length - 1];
    const currentLevelContainer = { pivot, gte: [], lt: [] };

    for (let i = 0, j = arr.length - 1; i < j; i++) {
      if (key ? (arr[i][key] >= pivot[key]) : (arr[i] >= pivot)) {
        if (key ? (!level && arr[i][key] === pivot[key]) : (!level && arr[i] === pivot)) { // collect equal vals only for the first level, for other ones - put them into gte
          currentLevelContainer.eq = arr.filter(el => key ? el[key] === pivot[key] : el === pivot);
        } else {
          currentLevelContainer.gte.push(arr[i]);
        }
      } else {
        currentLevelContainer.lt.push(arr[i]);
      }
    }

    sorted.push(currentLevelContainer);
  }
}
