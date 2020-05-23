// temporarily added empty params
const params = {};

if (sessionStorage.params_v1 === JSON.stringify(params)) {
  console.log('Params not changed, page created from cache.');
  const start = new Date().getTime();

  const temp = document.createElement('div');
  body.append(temp);
  temp.outerHTML = sessionStorage.page_v1;

  const { addOnClick, addOnHover } = makeElem();
  const thElems = document.querySelectorAll('th');

  for (const th of thElems) {
    addOnClick(th.id, { funcName: 'sortColumn' });
    addOnHover(th.id, { funcName: 'highlightColumn' });
  }

  console.log(`Rendered all for ${(new Date().getTime() - start) / 1000}s`);

} else {
  console.log('Page rendered by main logic.');
  const start = new Date().getTime();

  makeTable(params);

  console.log(`Rendered for ${(new Date().getTime() - start) / 1000}s`);
}
