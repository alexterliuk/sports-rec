const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const Table = require('../models/table');
const validateTypesInTable = require('../utils/validate-types-in-table');

// Create table
router.post('/table', auth, async (req, res) => {
  req.body.owner = req.session.userId;

  const tablesWithSameHyphenId = await Table.find({ hyphenId: req.body.hyphenId });
  const tableOfCurrentUser = tablesWithSameHyphenId.find(table => table.owner.toString() === req.session.userId);

  if (tableOfCurrentUser) {
    return res.status(409)
              .send({ error: 'Table cannot be saved - another table with same hyphenId already stored in database.' });
  }

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
});

module.exports = router;
