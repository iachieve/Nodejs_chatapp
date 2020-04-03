const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

app.listen(PORT, console.log(`server started at ${PORT}`));