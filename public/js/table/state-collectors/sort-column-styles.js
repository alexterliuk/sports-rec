/**
 * Collector of styles imposed on column when Sort column is clicked.
 * These styleSheets added to document.adoptedStyleSheets in highlightColumn.
 */
const sortColumnStyles = (function() {
  const _styleSheets = {};

  const addStyleSheet = (hyphenId, styleSheet) => { _styleSheets[hyphenId] = styleSheet; };

  const getStyleSheet = hyphenId => _styleSheets[hyphenId];

  const getAllStyleSheets = () => _styleSheets;

  return { addStyleSheet, getStyleSheet, getAllStyleSheets };
})();

const { addStyleSheet, getStyleSheet, getAllStyleSheets } = sortColumnStyles;

export { addStyleSheet, getStyleSheet, getAllStyleSheets };
