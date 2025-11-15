const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Load data
let data = { teachers: [], timetable: {}, substitutes: {} };
const DATA_FILE = 'data.json';

if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save data
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// =====================
//      API ROUTES
// =====================

// Get all teachers
app.get('/teachers', (req, res) => {
    res.json({ teachers: data.teachers });
});

// Add a new teacher
app.post('/teachers', (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Teacher name is required" });
    if (!data.teachers.includes(name)) {
        data.teachers.push(name);
        saveData();
    }

    res.json({ teachers: data.teachers, message: "Teacher added" });
});

// Get timetable of a teacher
app.get('/timetable/:teacher', (req, res) => {
    const teacher = req.params.teacher;
    const timetable = data.timetable[teacher] || [];
    res.json({ timetable });
});

// Save timetable
app.post('/timetable', (req, res) => {
    const { teacher, timetable } = req.body;
    data.timetable[teacher] = timetable;
    saveData();
    res.json({ message: "Timetable saved" });
});

// Assign substitute
app.post('/substitute', (req, res) => {
    const { absentTeacher, substituteTeacher, day, period, className } = req.body;

    if (!data.substitutes[absentTeacher]) {
        data.substitutes[absentTeacher] = [];
    }

    data.substitutes[absentTeacher].push({
        substituteTeacher,
        day,
        period,
        className
    });

    saveData();
    res.json({ message: "Substitute assigned" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

