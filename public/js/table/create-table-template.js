function createTableTemplate({ parentSelector, contId, rowsQty, colsQty }) {
  const params = {
    parentSelector,
    contId,
    tagName: 'table',
  };

  buildDOM(params);
}
