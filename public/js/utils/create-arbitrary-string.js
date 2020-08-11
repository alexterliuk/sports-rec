/**
 * Create arbitrary string of specified length.
 * @param {number} length
 */
function createArbitraryString(length) {
  const alphabet = (alph => alph + alph + alph + alph)('abcdefghijklmnopqrstuvwxyz');
  const getRandomIndex = () => +`${('' + Math.random()).slice(-2)}`;

  return (() => {
    let id = '';
    for (let i = 0; i < length; i++) {
      const index = getRandomIndex();
      const char = index % 2 ? alphabet[index] : alphabet[index].toUpperCase();
      id += char;
    }
    return id;
  })();
}

export default createArbitraryString;
