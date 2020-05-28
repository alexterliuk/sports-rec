const containsOnlyLetNumUnderscore = val => [...val].every(char => RegExp('\\w').test(char));

module.exports = {
  containsOnlyLetNumUnderscore,
};
