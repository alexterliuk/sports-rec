const express = require('express');
const router = new express.Router();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongooseConnection = require('../db/mongoose');
const User = require('../models/user');
const isValidPassword = require('../middleware/is-valid-password');

router.use(session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection }),
  cookie: { maxAge: 604800000 /*one week*/, sameSite: true },
}));

// Check whether current session is under logged in user
router.get('/is-logged-in', async (req, res) => {
  const user = await User.findById(req.session.userId);

  if (user) {
    res.json({ name: user.name });
  } else {
    res.status(204).send();
  }
});

// Create user
router.post('/sign-up', isValidPassword, async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Sign in
router.post('/sign-in', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.name, req.body.password);
    const token = await user.generateAuthToken();
    req.session.userId = user._id;

    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
