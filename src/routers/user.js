const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const isValidPassword = require('../middleware/is-valid-password');

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

module.exports = router;
