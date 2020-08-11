/**
 * Copy table data object except element and parent which are HTML elements.
 */
function createNewTableDataObject(obj) {
  if (obj) {
    const newObj = {};

    Object.keys(obj).forEach(key => {
      if (key !== 'element' && key !== 'parent') {
        newObj[key] = JSON.parse(JSON.stringify(obj[key]));

      } else {
        newObj[key] = obj[key];
      }
    });

    return newObj;
  }
}

export default createNewTableDataObject;
