require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

console.log("API URL:", process.env.REACT_APP_API_URL);


app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});