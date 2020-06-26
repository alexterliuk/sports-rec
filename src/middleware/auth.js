const User = require('../models/user');

const auth = async(req, res, next) => {
  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.status(401).send({ error: 'Please authorize.' });
  }

  next();
};

module.exports = auth;
