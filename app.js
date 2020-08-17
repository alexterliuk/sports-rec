const fs = require('fs');
const path = require('path');
const express = require('express');
require('./src/db/mongoose');
const userRouter = require('./src/routers/user');
const tableRouter = require('./src/routers/table');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(tableRouter);

// store static files in cache for one week
app.use((req, res, next) => {
  res.set('Cache-control', 'public, max-age=604800');
  next();
});

const publicDirectoryPath = path.join(__dirname, '/public');
app.use(express.static(publicDirectoryPath));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});
