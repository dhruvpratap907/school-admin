const API = 'http://localhost:5000'; // backend URL

let currentUser = null;
let userRole = null;

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
const timetableTable = document.querySelector('#timetableTable tbody');
const teacherTimetable = document.querySelector('#teacherTimetable tbody');
const subAssignments = document.getElementById('subAssignments');

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
        alert(data.message);
        return;
    }

    currentUser = username;
    userRole = data.role;

    if (userRole === 'admin') showAdmin();
    else showTeacher(currentUser);
});

// Show admin dashboard
async function showAdmin() {
    loginDiv.classList.add('hidden');
    adminDiv.classList.remove('hidden');
    await loadTeachers();
}

// Show teacher dashboard
async function showTeacher(username) {
    loginDiv.classList.add('hidden');
    teacherDiv.classList.remove('hidden');
    await loadTeacherTimetable(username);
}

// Load teachers for admin
async function loadTeachers() {
    const res = await fetch(`${API}/teachers`);
    const teachers = await res.json();

    // Populate teacher selects
    selectedTeacher.innerHTML = '';
    subTeacher.innerHTML = '';
    teachers.forEach(t => {
        const opt1 = document.createElement('option');
        opt1.value = t.username;
        opt1.textContent = t.name;
        selectedTeacher.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = t.username;
        opt2.textContent = t.name;
        subTeacher.appendChild(opt2);
    });

    loadAdminTimetable();
}

// Load admin timetable table
async function loadAdminTimetable() {
    const username = selectedTeacher.value;
    const res = await fetch(`${API}/timetable/${username}`);
    const timetableData = await res.json();

    timetableTable.innerHTML = '';

    ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${day}</td>`;
        for (let p=1; p<=8; p++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = (timetableData[day] && timetableData[day][p]) || '';
            input.addEventListener('change', async () => {
                if(!timetableData[day]) timetableData[day]={};
                timetableData[day][p] = input.value;

                await fetch(`${API}/timetable/${username}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(timetableData)
                });
            });
            cell.appendChild(input);
            row.appendChild(cell);
        }
        timetableTable.appendChild(row);
    });
}

// Assign substitute
document.getElementById('assignSub').addEventListener('click', async () => {
    const payload = {
        teacher: subTeacher.value,
        day: subDay.value,
        period: subPeriod.value
    };

    await fetch(`${API}/substitute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    alert('Substitute assigned!');
});

// Load teacher timetable
async function loadTeacherTimetable(username) {
    const res = await fetch(`${API}/timetable/${username}`);
    const timetableData = await res.json();

    const resSub = await fetch(`${API}/substitutes`);
    const substitutes = await resSub.json();

    teacherTimetable.innerHTML = '';
    subAssignments.innerHTML = '';

    ['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${day}</td>`;
        for (let p=1; p<=8; p++) {
            const cell = document.createElement('td');
            let content = (timetableData[day] && timetableData[day][p]) || 'Free';

            if(substitutes[day] && substitutes[day][p] === username) {
                content += ' (Substitute)';
                cell.classList.add('substitute');
                const li = document.createElement('li');
                li.textContent = `${day} Period ${p}`;
                subAssignments.appendChild(li);
            }

            cell.textContent = content;
            row.appendChild(cell);
        }
        teacherTimetable.appendChild(row);
    });
}

// Logout buttons
document.getElementById('logoutAdmin').addEventListener('click', () => location.reload());
document.getElementById('logoutTeacher').addEventListener('click', () => location.reload());

// Change selected teacher triggers timetable reload
selectedTeacher.addEventListener('change', loadAdminTimetable);

