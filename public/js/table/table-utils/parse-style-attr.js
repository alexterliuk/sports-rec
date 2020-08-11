/**
 * Parse style attribute of html tag.
 * @param {string} htmlStr - outerHTML | innerHTML
 * @returns {array}
 */
function parseStyleAttr(htmlStr) {
  const _htmlStr = typeof htmlStr === 'string' && htmlStr || '';
  const firstTagOnlyStr = _htmlStr.slice(0, _htmlStr.search('>'));

  const stylesRawStr = firstTagOnlyStr.split('style="')[1];
  if (!stylesRawStr) return [];

  const styles = [];
  const stylesOnlyStr = stylesRawStr.slice(stylesRawStr.search(/\/\*|\w/), stylesRawStr.search('"')).trim();

  const stylesNotParsed = stylesOnlyStr.split(/;\*\/|; \*\/|;/);

  for (const style of stylesNotParsed) {
    if (style && !/\/\*\w|\/\* /g.test(style)) { // not commented style
      const split = style.split(':');
      const parsedStyle = {
        name: (n => n.slice(n.search(/\w/)))(split[0].trim()),
        value: (split[1] || '').trim(),
      };

      const styleNameSplit = parsedStyle.name.split('-');
      if (styleNameSplit[1]) {
        const camelCasedPart = styleNameSplit.slice(1).map(str => `${str[0].toUpperCase()}${str.slice(1)}`).join('');
        parsedStyle.name = styleNameSplit[0].concat(camelCasedPart);
      }

      styles.push(parsedStyle);
    }
  }

  return styles;
}

export default parseStyleAttr;
