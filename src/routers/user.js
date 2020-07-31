const express = require('express');
const router = new express.Router();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongooseConnection = require('../db/mongoose');
const User = require('../models/user');
const Table = require('../models/table');
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
    res.send({ name: user.name });
  } else {
    res.status(204).send();
  }
});

// Create user
router.post('/sign-up', isValidPassword, async (req, res) => {
  const user = new User(req.body);
  req.session.userId = user._id;
  req.session.username = req.body.name;

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
    req.session.username = req.body.name;

    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Log out
router.post('/log-out', async (req, res) => {
  try {
    await req.session.destroy();
    res.clearCookie(process.env.SESS_NAME);

    res.send();
  } catch (error) {
    res.status(500).send({ error: 'Failed to log out.'});
  }
});

// Delete user and their tables
router.delete('/delete-user', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.session.username, req.body.password);
    if (!user) throw new Error();

    let stop = 0;
    while (await Table.findOneAndDelete({ owner: req.session.userId })) {
      if (++stop === 1000) break;
    }

    await User.findOneAndDelete({ _id: req.session.userId });
    await req.session.destroy();
    res.clearCookie(process.env.SESS_NAME);

    res.send({ deleted: true });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete user.'});
  }
});

module.exports = router;
