const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Data file
const DATA_FILE = 'data.json';
let data = { teachers: [], timetable: {}, substitutes: {} };

// Load data from file
if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save data to file
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// -----------------------
// Routes
// -----------------------

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin') {
        return res.json({ success: true, role: 'admin' });
    }

    const teacher = data.teachers.find(t => t.username === username && t.password === password);
    if (teacher) {
        return res.json({ success: true, role: 'teacher' });
    }

    res.json({ success: false, message: 'Invalid credentials' });
});

// Get all teachers
app.get('/teachers', (req, res) => {
    res.json(data.teachers);
});

// Get timetable of a teacher
app.get('/timetable/:username', (req, res) => {
    const username = req.params.username;
    res.json(data.timetable[username] || {});
});

// Update timetable of a teacher
app.post('/timetable/:username', (req, res) => {
    const username = req.params.username;
    data.timetable[username] = req.body;
    saveData();
    res.json({ success: true });
});

// Get all substitutes
app.get('/substitutes', (req, res) => {
    res.json(data.substitutes);
});

// Assign a substitute
app.post('/substitute', (req, res) => {
    const { teacher, day, period } = req.body;

    if (!data.substitutes[day]) data.substitutes[day] = {};
    data.substitutes[day][period] = teacher;
    saveData();

    res.json({ success: true });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

