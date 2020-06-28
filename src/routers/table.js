const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const Table = require('../models/table');
const validateAndCreateTable = require('../utils/validate-and-create-table');

// Create table
router.post('/tables', auth, async (req, res) => {
  req.body.owner = req.session.userId;

  const tablesWithSameHyphenId = await Table.find({ hyphenId: req.body.hyphenId });
  const tableOfCurrentUser = tablesWithSameHyphenId.find(table => table.owner.toString() === req.session.userId);

  if (tableOfCurrentUser) {
    return res.status(409)
              .send({ error: 'Table cannot be saved - another table with same hyphenId already stored in database.' });
  }

  try {
    const table = validateAndCreateTable(req.body);
    await table.save();
    res.send({ id: table._id });

  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Collect hyphenIds from all saved tables of current user
router.get('/table/hyphen-ids', auth, async (req, res) => {
  try {
    const tables = await Table.find({ owner: req.session.userId });
    const hyphenIds = tables.map(table => table.hyphenId);
    res.send(hyphenIds);

  } catch(error) {
    res.status(500).send(error);
  }
});

module.exports = router;
