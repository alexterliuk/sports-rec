const containsOnlyLetNumUnderscore = val => [...val].every(char => RegExp('\\w').test(char));

// pattern: '-' followed by 3 lowercase letters
const validateHyphenId = hyphenId => /^-[a-z]{3}$/.test(hyphenId);

module.exports = {
  containsOnlyLetNumUnderscore,
  validateHyphenId,
};
