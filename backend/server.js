const express = require('express');
const path = require('path');
const app = express();

// Serve frontend files
app.use(express.static(path.join(__dirname))); // index.html, script.js are in root

// For any other route, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

