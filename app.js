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

const publicDirectoryPath = path.join(__dirname, '/public');
app.use(express.static(publicDirectoryPath));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});
