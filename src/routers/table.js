const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const Table = require('../models/table');
const validateTypesInTable = require('../utils/validate-types-in-table');

// Create table
router.post('/table', async (req, res) => {
  const user = await User.findById(req.session.userId);

  if (user) {
    req.body.owner = req.session.userId;

    if (!validateTypesInTable(req.body)) {
      return res.status(400)
                .send({ error: 'Some type in the table is different from what specified in table schema.'});
    }

    const table = new Table(req.body);

    try {
      await table.save();
      res.send({ id: table._id });

    } catch (error) {
      res.status(400).send(error);
    }

  } else {
    res.status(401).send({ error: 'Please authorize.' });
  }
});

module.exports = router;
