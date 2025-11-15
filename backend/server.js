app.use(express.static(__dirname)); // everything in backend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

