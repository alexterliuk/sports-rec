const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const Table = require('../models/table');
const validateTableData = require('../utils/validate-table-data');

// Create table
router.post('/tables/new', auth, async (req, res) => {
  req.body.owner = req.session.userId;

  const tablesWithSameHyphenId = await Table.find({ hyphenId: req.body.hyphenId });
  const tableOfCurrentUser = tablesWithSameHyphenId.find(table => table.owner.toString() === req.session.userId);

  if (tableOfCurrentUser) {
    return res.status(409)
              .send({ error: 'Table cannot be saved - another table with same hyphenId already stored in database.' });
  }

  try {
    validateTableData(req.body);
    const table = new Table(req.body);
    await table.save();
    res.send({ id: table._id });

  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Collect hyphenIds from all stored tables in database
router.get('/tables/hyphen-ids', auth, async (req, res) => {
  try {
    const tables = await Table.find({});
    const hyphenIds = tables.map(table => table.hyphenId);
    res.send(hyphenIds);

  } catch(error) {
    res.status(500).send(error);
  }
});

// Collect hyphenIds from all saved tables of current user
router.get('/tables/:username/hyphen-ids', auth, async (req, res) => {
  const user = await User.findOne({ name: req.params.username });
  const owner = await user._id.toString();

  try {
    if (owner !== req.session.userId) throw new Error('You cannot get hyphenIds from tables of another user.');

    const tables = await Table.find({ owner });
    const hyphenIds = tables.map(table => table.hyphenId);
    res.send(hyphenIds);

  } catch(error) {
    res.status(500).send({ error: error.message });
  }
});

// Get tables
// pagination - /tasks?limit=10&skip=10
router.get('/tables', auth, async (req, res) => {
  const user = await User.findOne({ _id: req.session.userId });

  try {
    await user.populate({
      path: 'tables',
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
      }
    }).execPopulate();

    res.send(user.tables);

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get table
router.get('/tables/:id', auth, async (req, res) => {
  try {
    const table = await Table.findOne({ _id: req.params.id });

    if (!table || table.owner.toString() !== req.session.userId) {
      res.status(404).send();

    } else {
      res.send(table);
    }

  } catch(error) {
    // Cast to ObjectId failed because of wrong string (must be 12 bytes | 24 hex)
    res.status(400).send({ error: 'Invalid table id.' });
  }
});

module.exports = router;
