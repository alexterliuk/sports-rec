/**
 * Create and show notification within .table-panel.
 * @param {string} tableId
 * @param {string} message
 * @param {string} type - success | error
 * @param {number} fadeAfter
 */
function notify(tableId, message, type, fadeAfter) {
  const _getElem = tagName => document.createElement(tagName);
  const _ = { n: {} };

  _.n.notifyWrapper = _getElem('div');
  _.n.notifyWrapper.classList.add('notify-wrapper');

  _.n.notify = _getElem('div');
  _.n.notify.classList.add('notify', type);

  _.n.text = _getElem('span');
  _.n.text.textContent = message;

  _.n.btnCross = _getElem('span');
  _.n.btnCross.textContent = 'x';
  _.n.btnCross.classList.add('btn-cross');
  _.n.btnCross.addEventListener('click', () => {
    _.n.notifyWrapper.remove();
    delete _.n;
  });

  _.n.notify.append(_.n.text, _.n.btnCross);
  _.n.notifyWrapper.append(_.n.notify);

  // .panels-block
  pickElem(tableId).parentElement.parentElement.append(_.n.notifyWrapper);

  setTimeout(() => {
    if (_.n) {
      _.n.notify.style.backgroundColor = 'transparent';
      _.n.notify.style.borderColor = 'transparent';
      _.n.text.style.color = 'transparent';
      _.n.btnCross.style.backgroundColor = 'transparent';
      _.n.btnCross.style.color = 'transparent';

      setTimeout(() => {
        _.n.notifyWrapper.remove();
        delete _.n;
      }, 1000);
    }
  }, fadeAfter);
}
