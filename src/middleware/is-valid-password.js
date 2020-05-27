const isValidPassword = (req, res, next) => {
  const { password } = req.body;
  const valid = [...password].every(char => RegExp('\\w').test(char));

  try {
    if (!valid) throw new Error();
    next();
  } catch (error) {
    res.status(400).send({ error: 'Password cannot contain characters other than letters, numbers, or _.' });
  }
};

module.exports = isValidPassword;
