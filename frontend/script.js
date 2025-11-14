const API = 'http://school-admin.onrender.com'; // Change to your live URL when deployed

let teachers = [];
let timetable = {};      // {teacher: {day: {period: subject or 'Free'}}}
let substitutes = {};    // {day: {period: subTeacher}}
let currentUser = null;

// Elements
const loginForm = document.getElementById('loginForm');
const loginDiv = document.getElementById('login');
const adminDiv = document.getElementById('admin');
const teacherDiv = document.getElementById('teacher');
const selectedTeacher = document.getElementById('selectedTeacher');
const subTeacher = document.getElementById('subTeacher');
const subDay = document.getElementById('subDay');
const subPeriod = document.getElementById('subPeriod');
const subclass = document.getElementById('subclass');

// ------------------ LOGIN ------------------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Fetch teachers from backend
    await loadTeachers();

    if (username === 'admin' && password === 'admin') {
        currentUser = 'admin';
        showAdmin();
    } else if (teachers.includes(username) && password === 'teacher') {
        currentUser = username;
        showTeacher(username);
    } else {
        alert('Invalid credentials');
    }
});

// ------------------ LOAD TEACHERS FROM BACKEND ------------------
async function loadTeachers() {
    try {
        const res = await fetch(`${API}/teachers`);
        const data = await res.json();
        teachers = data.teachers;

        // Initialize timetable for new teachers if not already present
        teachers.forEach(teacher => {
            if (!timetable[teacher]) {
                timetable[teacher] = {};
                ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
                    timetable[teacher][day] = {};
                    for (let p=1; p<=8; p++) timetable[teacher][day][p] = `Subject ${p}`;
                });
            }
        });

    } catch (err) {
        console.error('Failed to load teachers:', err);
        alert('Could not load teachers from backend.');
    }
}

// ------------------ ADMIN DASHBOARD ------------------
function showAdmin() {
    loginDiv.classList.add('hidden');
    adminDiv.classList.remove('hidden');
    loadAdminPanel();
}

function loadAdminPanel() {
    // Populate teachers table
    const tbody = document.querySelector('#teachersTable tbody');
    tbody.innerHTML = '';
    teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${teacher}</td><td><button onclick="editTeacher('${teacher}')">Edit Timetable</button></td>`;
        tbody.appendChild(row);
    });

    // Populate teacher select dropdowns
    const selects = [selectedTeacher, subTeacher];
    selects.forEach(select => {
        select.innerHTML = '';
        teachers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            select.appendChild(opt);
        });
    });

    loadTimetable();

    selectedTeacher.addEventListener('change', loadTimetable);
    document.getElementById('assignSub').onclick = () => {
        showModal('Assign substitute?', assignSubstitute);
    };
    document.getElementById('logoutAdmin').onclick = logout;
}

function loadTimetable() {
    const teacher = selectedTeacher.value;
    const tbody = document.querySelector('#timetableTable tbody');
    tbody.innerHTML = '';

    ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${day}</td>`;
        for (let p=1; p<=8; p++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = timetable[teacher][day][p] || '';
            input.addEventListener('change', () => {
                timetable[teacher][day][p] = input.value;
                saveData();
            });
            cell.appendChild(input);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    });
}

function editTeacher(teacher) {
    selectedTeacher.value = teacher;
    loadTimetable();
}

function assignSubstitute() {
    const subT = subTeacher.value;
    const day = subDay.value;
    const period = subPeriod.value;

    if (!substitutes[day]) substitutes[day] = {};
    substitutes[day][period] = subT;
    saveData();
    alert(`Substitute ${subT} assigned for ${day} Period ${period}`);
    loadTeacherPanel(subT);
}

// ------------------ TEACHER DASHBOARD ------------------
function showTeacher(teacher) {
    loginDiv.classList.add('hidden');
    teacherDiv.classList.remove('hidden');
    loadTeacherPanel(teacher);
}

function loadTeacherPanel(teacher) {
    const tbody = document.querySelector('#teacherTimetable tbody');
    tbody.innerHTML = '';

    ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${day}</td>`;
        for (let p=1; p<=8; p++) {
            const cell = document.createElement('td');
            let content = timetable[teacher][day][p] || 'Free';
            if (substitutes[day] && substitutes[day][p] === teacher) {
                content += ' (Substitute)';
                cell.classList.add('substitute');
            }
            cell.textContent = content;
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    });

    // List substitute assignments
    const ul = document.getElementById('subAssignments');
    ul.innerHTML = '';
    ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
        for (let p=1; p<=8; p++) {
            if (substitutes[day] && substitutes[day][p] === teacher) {
                const li = document.createElement('li');
                li.textContent = `${day} Period ${p}`;
                ul.appendChild(li);
            }
        }
    });

    document.getElementById('logoutTeacher').onclick = logout;
}

// ------------------ SAVE DATA ------------------
function saveData() {
    localStorage.setItem('timetable', JSON.stringify(timetable));
    localStorage.setItem('substitutes', JSON.stringify(substitutes));
}

// ------------------ LOGOUT ------------------
function logout() {
    adminDiv.classList.add('hidden');
    teacherDiv.classList.add('hidden');
    loginDiv.classList.remove('hidden');
    loginForm.reset();
}

// ------------------ MODAL ------------------
function showModal(text, yesCallback) {
    document.getElementById('modalText').textContent = text;
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'block';

    document.getElementById('confirmYes').onclick = () => {
        yesCallback();
        modal.style.display = 'none';
    };
    document.getElementById('confirmNo').onclick = () => {
        modal.style.display = 'none';
    };
}

document.querySelector('.close').onclick = () => {
    document.getElementById('confirmModal').style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == document.getElementById('confirmModal')) {
        document.getElementById('confirmModal').style.display = 'none';
    }
};
   
