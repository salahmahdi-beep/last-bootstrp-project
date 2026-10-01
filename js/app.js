/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */
let patients = JSON.parse(localStorage.getItem('hms5_patients') || '[]');
let appointments = JSON.parse(localStorage.getItem('hms5_appointments') || '[]');
let invoices = JSON.parse(localStorage.getItem('hms5_invoices') || '[]');
let rooms = JSON.parse(localStorage.getItem('hms5_rooms') || 'null') || genRooms();
let labTests = JSON.parse(localStorage.getItem('hms5_lab') || '[]');
let activity = JSON.parse(localStorage.getItem('hms5_activity') || '[]');

let editPtIdx = -1,
    editLabIdx = -1,
    editRoomIdx = -1;
let currentInvoice = null;

// Seed patients
if (patients.length === 0) {
    patients = [
        { id: 'P001', name: 'Salah Al-Mahdi', age: 22, phone: '0501234567', doctor: 'Dr. Ahmed Hassan', blood: 'A+', gender: 'Male', created: new Date().toISOString() },
        { id: 'P002', name: 'Fatima Ali', age: 34, phone: '0509876543', doctor: 'Dr. Sara Malik', blood: 'O+', gender: 'Female', created: new Date().toISOString() },
        { id: 'P003', name: 'Omar Khalid', age: 28, phone: '0507654321', doctor: 'Dr. Ahmed Hassan', blood: 'B-', gender: 'Male', created: new Date().toISOString() },
        { id: 'P004', name: 'Nora Hassan', age: 45, phone: '0503456789', doctor: 'Dr. Layla Hassan', blood: 'AB+', gender: 'Female', created: new Date().toISOString() },
    ];
}
// Seed appointments
if (appointments.length === 0) {
    const t = new Date().toISOString().split('T')[0];
    appointments = [
        { id: 'A001', patient: 'Salah Al-Mahdi', doctor: 'Dr. Ahmed Hassan', date: t, time: '09:00', type: 'Checkup', status: 'Confirmed', fee: 150 },
        { id: 'A002', patient: 'Fatima Ali', doctor: 'Dr. Sara Malik', date: t, time: '11:00', type: 'Follow-up', status: 'Pending', fee: 120 },
        { id: 'A003', patient: 'Omar Khalid', doctor: 'Dr. Yousif Omar', date: '2026-04-20', time: '14:00', type: 'Consultation', status: 'Confirmed', fee: 180 },
    ];
}
// Seed lab
if (labTests.length === 0) {
    labTests = [
        { id: 'L001', test: 'Complete Blood Count', patient: 'Salah Al-Mahdi', doctor: 'Dr. Ahmed Hassan', result: 'Normal', status: 'Completed', date: '2026-04-01' },
        { id: 'L002', test: 'Blood Glucose', patient: 'Fatima Ali', doctor: 'Dr. Sara Malik', result: 'High', status: 'Completed', date: '2026-04-02' },
        { id: 'L003', test: 'Chest X-Ray', patient: 'Omar Khalid', doctor: 'Dr. Yousif Omar', result: '—', status: 'Pending', date: '2026-04-03' },
    ];
}
saveAll();

// DOCTORS_LIST kept for compatibility — points to DOCTORS_FULL
const DOCTORS_LIST_OLD = [
    { name: 'Dr. Ahmed Hassan', specialty: 'Cardiology', fee: 150 },
    { name: 'Dr. Sara Malik', specialty: 'Neurology', fee: 120 },
    { name: 'Dr. Yousif Omar', specialty: 'Orthopedics', fee: 180 },
    { name: 'Dr. Layla Hassan', specialty: 'Pediatrics', fee: 100 },
];

const DOCTORS_FULL = [
    { id: 'D001', name: 'Dr. Salah Mahdi', specialty: 'Cardiology', fee: 150, phone: '+91 70582 85198', exp: '18 yrs', status: 'available', img: 'https://scontent.fbom12-2.fna.fbcdn.net/v/t39.30808-1/658580134_1357176192990492_6578863775921583775_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8USiNAX99vMQ7kNvwGRe0Km&_nc_oc=AdqK76RT09Wdu6TeXVPfeoeWVIFQdTzf3LqbAPO6GPCcZ2o8HqvuVhcL7zfpMmZIFls&_nc_zt=24&_nc_ht=scontent.fbom12-2.fna&_nc_gid=5Uz5fy89xChOG9TKWrC32A&_nc_ss=7a3a8&oh=00_Af02llQw7l-vgXc4A5SW2NEnT66D6LW7LcLDkZQJVHHG1g&oe=69D9CD6A', desc: 'Expert in interventional cardiology and heart failure.', rating: 4.9, pts: 1240 },
    { id: 'D002', name: 'Dr. Mohamed Yosif', specialty: 'Neurology', fee: 120, phone: '+91 89835 95209', exp: '14 yrs', status: 'available', img: 'https://scontent.fbom12-2.fna.fbcdn.net/v/t39.30808-6/480658529_1402932537744300_2979657970355511811_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=7b2446&_nc_ohc=ReDNK6Ovs9cQ7kNvwHlN8ZN&_nc_oc=AdodOlB8uY29hv04M0D1-9Cf86E_bSU4H5Ek0dhmiridSXm5YjJ2XPZJHiq0PB-o-9M&_nc_zt=23&_nc_ht=scontent.fbom12-2.fna&_nc_gid=WPlzsRdfedP4J77oMP5Umg&_nc_ss=7a3a8&oh=00_Af2xjAKPZoV92950cNtHZZEfO_j5IFg-Cb-RNg0LoYsPcQ&oe=69D9CBE5', desc: 'Epilepsy, stroke and headache specialist.', rating: 4.8, pts: 980 },
    { id: 'D003', name: 'Dr. Abhi Wahatule', specialty: 'Orthopedics', fee: 180, phone: '+91 72767 57962', exp: '12 yrs', status: 'busy', img: 'https://i.postimg.cc/FH6FnFwq/image.png', desc: 'Joint replacement and sports injury expert.', rating: 4.7, pts: 870 },
    { id: 'D004', name: 'Dr. Nader Mahdi', specialty: 'Pediatrics', fee: 100, phone: '+91 90670 02737', exp: '10 yrs', status: 'available', img: 'https://i.postimg.cc/yNfGTW5y/Whats-App-Image-2026-04-06-at-11-37-59-PM.jpg', desc: 'Child health, development and preventive care.', rating: 4.9, pts: 1560 },
    { id: 'D005', name: 'Dr. Mohamed Omer', specialty: 'Oncology', fee: 220, phone: '+91 73783 93295', exp: '20 yrs', status: 'available', img: 'https://i.postimg.cc/CKDSK3Kp/Whats-App-Image-2026-04-07-at-12-55-50-AM.jpg', desc: 'Cancer therapy and immunotherapy researcher.', rating: 4.8, pts: 640 },
    { id: 'D006', name: 'Dr. Al-Baraa Nasr', specialty: 'Dermatology', fee: 130, phone: '+91 8446360514', exp: '9 yrs', status: 'available', img: 'https://i.postimg.cc/yYXf7vK5/Whats-App-Image-2026-04-07-at-1-04-55-AM.jpg', desc: 'Skin diseases and cosmetic dermatology.', rating: 4.7, pts: 1120 },
    { id: 'D007', name: 'Dr. Khalid Al-Yamani', specialty: 'General Surgery', fee: 200, phone: '+967 771 181 006', exp: '16 yrs', status: 'busy', img: 'https://i.postimg.cc/6529S4xP/Whats-App-Image-2026-04-07-at-1-10-17-AM.jpg', desc: 'Minimally invasive and laparoscopic surgeries.', rating: 4.6, pts: 760 },
    { id: 'D008', name: 'Dr. Abdullah Riyad', specialty: 'Gynecology', fee: 140, phone: '+91 98335 26706', exp: '13 yrs', status: 'available', img: 'https://i.postimg.cc/26gLhF7g/image.png', desc: 'High-risk pregnancy and reproductive health.', rating: 4.9, pts: 1380 },
    { id: 'D009', name: 'Dr. Altayeb Gasim', specialty: 'Radiology', fee: 160, phone: '+91 9028863688', exp: '11 yrs', status: 'available', img: 'https://i.postimg.cc/MpjBZL0Q/image.png', desc: 'MRI, CT scan and ultrasound diagnostics.', rating: 4.7, pts: 2100 },
    { id: 'D010', name: 'Dr. Imran Sasa', specialty: 'Psychiatry', fee: 110, phone: '+91 9076139821', exp: '8 yrs', status: 'available', img: 'https://i.postimg.cc/gJMyLZxh/Whats-App-Image-2026-04-07-at-12-25-08-AM.jpg', desc: 'Mood disorders, anxiety and CBT specialist.', rating: 4.8, pts: 720 },
    { id: 'D011', name: 'Dr. Vaibhav Dilip Maske', specialty: 'Urology', fee: 170, phone: '+91 73857 37927', exp: '15 yrs', status: 'busy', img: 'https://i.postimg.cc/XqbGsKp8/Whats-App-Image-2026-04-07-at-12-33-24-AM.jpg', desc: 'Urological oncology and robotic surgery.', rating: 4.6, pts: 590 },
    { id: 'D012', name: 'Dr. Ruturaj Santosh Gholap', specialty: 'Ophthalmology', fee: 130, phone: '+91 82084 20800', exp: '10 yrs', status: 'available', img: 'https://i.postimg.cc/150T7yYG/image.png', desc: 'LASIK and corneal disease specialist.', rating: 4.8, pts: 940 },
    { id: 'D013', name: 'Dr. Aditya Babasaheb Thorat', specialty: 'ENT', fee: 120, phone: '+91 8830622972', exp: '12 yrs', status: 'available', img: 'https://i.postimg.cc/3wjdd4Ln/image.png', desc: 'Ear, nose and throat surgery including cochlear.', rating: 4.7, pts: 830 },
    { id: 'D014', name: 'Dr. Tushar Bhagwan Suryawanshi', specialty: 'Endocrinology', fee: 130, phone: '+91 10207 79750', exp: '11 yrs', status: 'available', img: 'https://i.postimg.cc/8c7pBjbv/image.png', desc: 'Diabetes and thyroid disorders.', rating: 4.9, pts: 1060 },
    { id: 'D015', name: 'Dr. Mustafa Al-Azraq', specialty: 'Nephrology', fee: 160, phone: '+91 77778 7777', exp: '17 yrs', status: 'busy', img: 'https://i.postimg.cc/FHNjG42b/Whats-App-Image-2026-04-07-at-12-52-36-AM.jpg', desc: 'Kidney disease and dialysis specialist.', rating: 4.6, pts: 480 },
    { id: 'D016', name: 'Dr. Rabie AL-Sharabi', specialty: 'Dentistry', fee: 90, phone: '+91 909899999', exp: '7 yrs', status: 'available', img: 'https://i.postimg.cc/65kG1NgG/Whats-App-Image-2026-04-07-at-1-20-43-AM.jpg', desc: 'Cosmetic dentistry and orthodontics.', rating: 4.8, pts: 1420 },
    { id: 'D017', name: 'Dr. Tariq Al-Hamdan', specialty: 'Pulmonology', fee: 140, phone: '+966 50 777 8899', exp: '14 yrs', status: 'available', img: 'https://i.postimg.cc/k5YPjTZf/image.png', desc: 'Respiratory medicine, asthma and lung cancer.', rating: 4.7, pts: 660 },
    { id: 'D018', name: 'Dr. Nadia Osman', specialty: 'Rheumatology', fee: 120, phone: '+966 50 888 9900', exp: '9 yrs', status: 'available', img: 'https://randomuser.me/api/portraits/women/82.jpg', desc: 'Arthritis, lupus and autoimmune diseases.', rating: 4.6, pts: 520 },
    { id: 'D019', name: 'Dr. Carlos Mendez', specialty: 'Emergency Medicine', fee: 250, phone: '+966 50 999 0011', exp: '13 yrs', status: 'busy', img: 'https://randomuser.me/api/portraits/men/48.jpg', desc: 'Trauma surgery and critical care 24/7.', rating: 4.9, pts: 3200 },
    { id: 'D020', name: 'Dr. Reem Al-Zahrani', specialty: 'Hematology', fee: 140, phone: '+966 50 100 1122', exp: '11 yrs', status: 'available', img: 'https://randomuser.me/api/portraits/women/90.jpg', desc: 'Blood disorders and bone marrow transplant.', rating: 4.7, pts: 410 },
];

const SPEC_CLR = {
    Cardiology: '#ef4444',
    Neurology: '#8b5cf6',
    Orthopedics: '#f59e0b',
    Pediatrics: '#10b981',
    Oncology: '#6366f1',
    Dermatology: '#ec4899',
    'General Surgery': '#14b8a6',
    Gynecology: '#f472b6',
    Radiology: '#3b82f6',
    Psychiatry: '#a78bfa',
    Urology: '#0ea5e9',
    Ophthalmology: '#22d3ee',
    ENT: '#84cc16',
    Endocrinology: '#fb923c',
    Nephrology: '#64748b',
    Dentistry: '#2dd4bf',
    Pulmonology: '#60a5fa',
    Rheumatology: '#c084fc',
    'Emergency Medicine': '#ef4444',
    Hematology: '#f43f5e'
};

let STAFF_LIST = [
    { id: 'S001', name: 'Dr. Khaled Al-Amin', role: 'Hospital Director', dept: 'Management', salary: 8500, phone: '+966 50 100 0001', email: 'director@alhayat.com', joined: '2015-03-01', status: 'active', color: '#0ea5e9' },
    { id: 'S002', name: 'Mrs. Hessa Al-Farsi', role: 'Deputy Director', dept: 'Operations', salary: 6200, phone: '+966 50 100 0002', email: 'deputy@alhayat.com', joined: '2017-06-15', status: 'active', color: '#6366f1' },
    { id: 'S003', name: 'Head Nurse Aisha', role: 'Head of Nursing', dept: 'ICU Nursing', salary: 3800, phone: '+966 50 100 0003', email: 'aisha@alhayat.com', joined: '2018-09-10', status: 'active', color: '#10b981' },
    { id: 'S004', name: 'Pharmacist Khalid', role: 'Chief Pharmacist', dept: 'Pharmacy', salary: 4200, phone: '+966 50 100 0004', email: 'pharmacy@alhayat.com', joined: '2019-01-20', status: 'active', color: '#f59e0b' },
    { id: 'S005', name: 'Lab Tech Sara', role: 'Lab Supervisor', dept: 'Laboratory', salary: 3200, phone: '+966 50 100 0005', email: 'lab@alhayat.com', joined: '2019-05-11', status: 'active', color: '#8b5cf6' },
    { id: 'S006', name: 'Omar Al-Zahrani', role: 'Radiologist', dept: 'Radiology', salary: 5500, phone: '+966 50 100 0006', email: 'radio@alhayat.com', joined: '2020-02-28', status: 'active', color: '#ef4444' },
    { id: 'S007', name: 'Nurse Fatima', role: 'Senior Nurse', dept: 'ICU', salary: 2600, phone: '+966 50 100 0007', email: 'nurse1@alhayat.com', joined: '2020-07-14', status: 'active', color: '#10b981' },
    { id: 'S008', name: 'Nurse Mona', role: 'Nurse', dept: 'Pediatrics', salary: 2400, phone: '+966 50 100 0008', email: 'nurse2@alhayat.com', joined: '2021-01-05', status: 'active', color: '#10b981' },
    { id: 'S009', name: 'Ali Receptionist', role: 'Receptionist', dept: 'Reception', salary: 2000, phone: '+966 50 100 0009', email: 'recep1@alhayat.com', joined: '2021-03-18', status: 'active', color: '#00b4d8' },
    { id: 'S010', name: 'Maha Al-Osman', role: 'Receptionist', dept: 'Reception', salary: 2000, phone: '+966 50 100 0010', email: 'recep2@alhayat.com', joined: '2021-03-18', status: 'active', color: '#00b4d8' },
    { id: 'S011', name: 'IT Admin Faris', role: 'IT Administrator', dept: 'IT', salary: 4500, phone: '+966 50 100 0011', email: 'it@alhayat.com', joined: '2019-11-01', status: 'active', color: '#3b82f6' },
    { id: 'S012', name: 'Security Chief Nael', role: 'Security Manager', dept: 'Security', salary: 2800, phone: '+966 50 100 0012', email: 'security@alhayat.com', joined: '2018-06-20', status: 'active', color: '#64748b' },
    { id: 'S013', name: 'Finance Mgr Walid', role: 'Finance Manager', dept: 'Finance', salary: 5800, phone: '+966 50 100 0013', email: 'finance@alhayat.com', joined: '2016-09-01', status: 'active', color: '#f97316' },
    { id: 'S014', name: 'HR Manager Lina', role: 'HR Manager', dept: 'HR', salary: 4800, phone: '+966 50 100 0014', email: 'hr@alhayat.com', joined: '2017-03-15', status: 'active', color: '#ec4899' },
    { id: 'S015', name: 'Maintenance Rashed', role: 'Maintenance Lead', dept: 'Facilities', salary: 1800, phone: '+966 50 100 0015', email: 'facility@alhayat.com', joined: '2022-01-10', status: 'active', color: '#84cc16' },
];

let staffList = STAFF_LIST;

/* ═══════════════════════════════════════════
   SAVE/LOAD
═══════════════════════════════════════════ */
function saveAll() {
    localStorage.setItem('hms5_patients', JSON.stringify(patients));
    localStorage.setItem('hms5_appointments', JSON.stringify(appointments));
    localStorage.setItem('hms5_invoices', JSON.stringify(invoices));
    localStorage.setItem('hms5_rooms', JSON.stringify(rooms));
    localStorage.setItem('hms5_lab', JSON.stringify(labTests));
    localStorage.setItem('hms5_activity', JSON.stringify(activity.slice(0, 30)));
}

function genRooms() {
    const types = ['General', 'ICU', 'Surgery', 'Private', 'Emergency'];
    const stats = ['available', 'occupied', 'available', 'maintenance', 'available'];
    return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        number: `R${String(i+1).padStart(3,'0')}`,
        type: types[i % 5],
        status: stats[i % 5],
        patient: '',
        notes: ''
    }));
}

/* ═══════════════════════════════════════════
   MODAL SYSTEM — THE FIX
═══════════════════════════════════════════ */
function openM(id) {
    const el = document.getElementById(id);
    if (!el) { console.error('Modal not found:', id); return; }
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeM(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
    document.body.style.overflow = '';
}
// Close on background click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function toast(msg, type = 'default') {
    const wrap = document.getElementById('toast-wrap');
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle', default: 'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast-item t-${type}`;
    t.innerHTML = `<i class="fas ${icons[type]||icons.default}"></i><span>${msg}</span>`;
    wrap.appendChild(t);
    setTimeout(() => {
        t.classList.add('out');
        setTimeout(() => t.remove(), 300);
    }, 3500);
}

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
const BC = {
    dashboard: ['Dashboard', 'Welcome back, Admin'],
    reception: ['Reception', 'Check-in & queue management'],
    patients: ['Patients', 'Manage all hospital patients'],
    appointments: ['Appointments', 'Schedule & track'],
    doctors: ['Our Doctors', '20 expert professionals'],
    laboratory: ['Laboratory', 'Tests & results'],
    rooms: ['Rooms', 'Room management'],
    staff: ['Staff', 'Support staff'],
    invoice: ['Invoices', 'Billing & payments'],
    reports: ['Reports', 'Analytics'],
};

function go(pageId, navEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page-' + pageId);
    if (pg) pg.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
    else { const found = document.querySelector(`.nav-item[onclick*="'${pageId}'"]`); if (found) found.classList.add('active'); }
    const info = BC[pageId] || [pageId, ''];
    document.getElementById('bc-title').textContent = info[0];
    document.getElementById('bc-sub').textContent = info[1];
    // Render
    const renders = {
        dashboard: () => renderDash(),
        patients: () => renderPatients(),
        appointments: () => {
            renderAppts();
            fillSelects();
        },
        doctors: () => {
            renderDoctors();
            buildDocFilter();
        },
        laboratory: () => { renderLab(); },
        rooms: () => renderRooms(),
        staff: () => renderStaff(),
        invoice: () => {
            renderInvTable();
            fillSelects();
        },
        reception: () => renderReception(),
        reports: () => renderReports(),
    };
    if (renders[pageId]) renders[pageId]();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('header').classList.toggle('coll');
    document.getElementById('main').classList.toggle('coll');
}

function toggleDark() {
    document.body.classList.toggle('dark');
    const on = document.body.classList.contains('dark');
    localStorage.setItem('hms5_dark', on);
    document.getElementById('darkIcon').className = on ? 'fas fa-sun' : 'fas fa-moon';
}

function logAct(text, color = 'teal') {
    activity.unshift({ text, color, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    saveAll();
}

/* ═══════════════════════════════════════════
   FILL SELECTS
═══════════════════════════════════════════ */
function fillSelects() {
    document.querySelectorAll('.patient-sel').forEach(sel => {
        const v = sel.value;
        sel.innerHTML = '<option value="">-- Select Patient --</option>' + patients.map(p => `<option value="${p.name}">${p.id} - ${p.name}</option>`).join('');
        sel.value = v;
    });
    document.querySelectorAll('.doctor-sel').forEach(sel => {
        const v = sel.value;
        sel.innerHTML = '<option value="">-- Select Doctor --</option>' + DOCTORS_FULL.map(d => `<option value="${d.name}">${d.name} (${d.specialty})</option>`).join('');
        sel.value = v;
    });
}

/* ═══════════════════════════════════════════
   FIELD VALIDATION
═══════════════════════════════════════════ */
function ferr(id, msg) {
    const el = document.getElementById(id);
    const er = document.getElementById('err-' + id);
    if (el) {
        el.classList.add('err');
        el.addEventListener('input', () => { el.classList.remove('err'); if (er) er.classList.remove('show'); }, { once: true });
    }
    if (er) {
        er.textContent = msg;
        er.classList.add('show');
    }
}

function fclr(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        const er = document.getElementById('err-' + id);
        if (el) {
            el.value = '';
            el.classList.remove('err');
        }
        if (er) er.classList.remove('show');
    });
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
let chartInst = null,
    repChartInst = null;

function renderDash() {
    const g = id => document.getElementById(id);
    const avail = rooms.filter(r => r.status === 'available').length;
    const pend = appointments.filter(a => a.status === 'Pending').length;
    if (g('sd-patients')) g('sd-patients').textContent = patients.length;
    if (g('sd-appts')) g('sd-appts').textContent = appointments.length;
    if (g('sd-rev')) g('sd-rev').textContent = '$' + invoices.reduce((s, i) => s + i.total, 0).toFixed(0);
    if (g('sd-inv')) g('sd-inv').textContent = invoices.length;
    if (g('sd-rooms')) g('sd-rooms').textContent = avail;
    if (g('sd-pend')) g('sd-pend').textContent = pend;
    const badge = g('notifBadge');
    if (badge) {
        badge.textContent = pend;
        badge.style.display = pend > 0 ? 'inline' : 'none';
    }
    const dot = g('notifDot');
    if (dot) dot.style.display = pend > 0 ? 'block' : 'none';

    // Today list
    const today = new Date().toISOString().split('T')[0];
    const todayA = appointments.filter(a => a.date === today);
    const tbadge = g('todayBadge');
    if (tbadge) tbadge.textContent = todayA.length;
    const tlist = g('todayList');
    if (tlist) tlist.innerHTML = todayA.length === 0 ? '<div class="text-muted text-sm" style="padding:8px 0">No appointments today</div>' :
        todayA.map(a => `<div class="activity-item"><div class="act-dot" style="background:#00b4d8"></div><div class="act-info"><strong>${a.patient}</strong><span>${a.doctor} · ${a.time}</span></div><span class="badge b-green">${a.status}</span></div>`).join('');

    // Activity
    const alist = g('activityList');
    if (alist) alist.innerHTML = activity.slice(0, 8).length === 0 ? '<div class="text-muted text-sm" style="padding:8px 0">No activity yet</div>' :
        activity.slice(0, 8).map(a => `<div class="activity-item"><div class="act-dot" style="background:${a.color==='teal'?'#00b4d8':a.color==='green'?'#10b981':a.color==='red'?'#ef4444':a.color==='orange'?'#f59e0b':'#64748b'}"></div><div class="act-info"><strong>${a.text}</strong><span>${a.time}</span></div></div>`).join('');

    // Chart
    const ctx = g('mainChart');
    if (ctx) {
        if (chartInst) chartInst.destroy();
        chartInst = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                datasets: [
                    { label: 'Patients', data: [12, 18, 15, 22, 19, 28, 24, 30], borderColor: '#00b4d8', backgroundColor: 'rgba(0,180,216,.08)', fill: true, tension: .4, borderWidth: 2.5, pointBackgroundColor: '#00b4d8', pointRadius: 4 },
                    { label: 'Appointments', data: [8, 14, 11, 17, 14, 22, 20, 25], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', fill: true, tension: .4, borderWidth: 2.5, pointBackgroundColor: '#10b981', pointRadius: 4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: true, interaction: { intersect: false, mode: 'index' }, plugins: { legend: { labels: { color: '#64748b', font: { size: 11 }, usePointStyle: true } }, tooltip: { backgroundColor: '#0f2040', titleColor: '#fff', bodyColor: '#94a3b8', borderColor: '#00b4d8', borderWidth: 1, padding: 10 } }, scales: { x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } } } }
        });
    }
}

function refreshDash() {
    renderDash();
    toast('Dashboard refreshed', 'success');
}

function showNotifs() {
    const p = appointments.filter(a => a.status === 'Pending');
    toast(p.length === 0 ? 'No pending notifications' : `${p.length} pending appointments`, p.length === 0 ? 'info' : 'warning');
}

function globalSearchFn(q) {
    q = q.toLowerCase().trim();
    if (!q) return;
    const r = patients.filter(p => p.name.toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q));
    if (r.length > 0) {
        go('patients', null);
        renderPatients(q);
    } else toast('No results: ' + q, 'warning');
}

/* ═══════════════════════════════════════════
   PATIENTS
═══════════════════════════════════════════ */
function openPatientModal() {
    editPtIdx = -1;
    clearPtForm();
    document.getElementById('pt-modal-title').textContent = 'Add New Patient';
    document.getElementById('pt-save-btn').innerHTML = '<i class="fas fa-save"></i> Save Patient';
    fillSelects();
    openM('modal-patient');
}

function clearPtForm() {
    fclr('pt-name', 'pt-age', 'pt-phone');
    ['pt-gender', 'pt-doctor', 'pt-blood'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
    editPtIdx = -1;
}

function savePatient() {
    const name = document.getElementById('pt-name').value.trim();
    const age = document.getElementById('pt-age').value.trim();
    const phone = document.getElementById('pt-phone').value.trim();
    const doctor = document.getElementById('pt-doctor').value;
    const blood = document.getElementById('pt-blood').value;
    const gender = document.getElementById('pt-gender').value;
    let ok = true;
    if (!name) {
        ferr('pt-name', 'Name is required');
        ok = false;
    }
    if (!age || isNaN(age) || +age < 0 || +age > 130) {
        ferr('pt-age', 'Valid age required');
        ok = false;
    }
    if (!phone || phone.length < 7) {
        ferr('pt-phone', 'Valid phone required');
        ok = false;
    }
    if (!doctor) {
        ferr('pt-doctor', 'Select a doctor');
        ok = false;
    }
    if (!ok) return;
    const pt = { name, age: +age, phone, doctor, blood, gender, created: new Date().toISOString() };
    if (editPtIdx === -1) {
        pt.id = 'P' + String(patients.length + 1).padStart(3, '0');
        patients.push(pt);
        logAct(`Patient ${name} added`, 'teal');
        toast('Patient added!', 'success');
    } else {
        pt.id = patients[editPtIdx].id;
        pt.created = patients[editPtIdx].created;
        patients[editPtIdx] = pt;
        editPtIdx = -1;
        logAct(`Patient ${name} updated`, 'orange');
        toast('Patient updated!', 'success');
    }
    saveAll();
    closeM('modal-patient');
    clearPtForm();
    renderPatients();
    renderDash();
    fillSelects();
}

function renderPatients(q = '') {
    const tbl = document.getElementById('ptTable');
    if (!tbl) return;
    const list = q ? patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.id || '').toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q)) : patients;
    if (!list.length) { tbl.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-user-injured"></i><p>${q?'No match':'No patients yet'}</p></div></td></tr>`; return; }
    const bc = { 'A+': '#ef4444', 'A-': '#dc2626', 'B+': '#f97316', 'B-': '#ea580c', 'O+': '#22c55e', 'O-': '#16a34a', 'AB+': '#8b5cf6', 'AB-': '#7c3aed' };
    tbl.innerHTML = list.map(p => { const ri = patients.indexOf(p); const ini = p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(); return `
  <tr>
    <td><span class="badge b-teal mono">${p.id||'N/A'}</span></td>
    <td><div class="flex gap8"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#00b4d8,#0077cc);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.72rem;font-weight:700;flex-shrink:0">${ini}</div><div><div class="fw7">${p.name}</div><div class="text-muted" style="font-size:.7rem">${p.gender||'—'}</div></div></div></td>
    <td>${p.age}</td>
    <td>${p.phone}</td>
    <td><span class="badge b-blue" style="font-size:.68rem">${p.doctor}</span></td>
    <td><span class="badge" style="background:${bc[p.blood]||'#64748b'}18;color:${bc[p.blood]||'#64748b'};border:1px solid ${bc[p.blood]||'#64748b'}30;font-weight:700">${p.blood||'—'}</span></td>
    <td><div class="flex gap4">
      <button class="btn btn-warning btn-sm" onclick="editPatient(${ri})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger  btn-sm" onclick="delPatient(${ri})"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`; }).join('');
}

function editPatient(i) {
    editPtIdx = i;
    const p = patients[i];
    document.getElementById('pt-name').value = p.name;
    document.getElementById('pt-age').value = p.age;
    document.getElementById('pt-phone').value = p.phone;
    document.getElementById('pt-modal-title').textContent = 'Edit Patient';
    document.getElementById('pt-save-btn').innerHTML = '<i class="fas fa-save"></i> Update';
    fillSelects();
    setTimeout(() => {
        document.getElementById('pt-doctor').value = p.doctor;
        document.getElementById('pt-blood').value = p.blood || '';
        document.getElementById('pt-gender').value = p.gender || '';
    }, 30);
    openM('modal-patient');
}

function delPatient(i) {
    if (confirm(`Delete "${patients[i].name}"?`)) {
        const n = patients[i].name;
        patients.splice(i, 1);
        saveAll();
        renderPatients();
        renderDash();
        fillSelects();
        logAct(`Patient ${n} deleted`, 'red');
        toast('Patient deleted', 'error');
    }
}

/* ═══════════════════════════════════════════
   APPOINTMENTS
═══════════════════════════════════════════ */
let editApptIdx = -1;

function openApptModal(preDoc) {
    editApptIdx = -1;
    document.getElementById('ap-patient').value = '';
    document.getElementById('ap-doctor').value = '';
    document.getElementById('ap-date').value = '';
    document.getElementById('ap-time').value = '';
    document.getElementById('ap-type').selectedIndex = 0;
    document.getElementById('ap-fee-info').textContent = 'Select a doctor to see fee';
    document.getElementById('ap-date').min = new Date().toISOString().split('T')[0];
    const titleEl = document.getElementById('ap-modal-title');
    if (titleEl) titleEl.textContent = 'Book Appointment';
    fillSelects();
    if (preDoc) {
        setTimeout(() => {
            document.getElementById('ap-doctor').value = preDoc;
            apptFee();
        }, 40);
    }
    openM('modal-appt');
}

function editApptFn(i) {
    editApptIdx = i;
    const a = appointments[i];
    const titleEl = document.getElementById('ap-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Appointment';
    fillSelects();
    setTimeout(() => {
        document.getElementById('ap-patient').value = a.patient;
        document.getElementById('ap-doctor').value = a.doctor;
        document.getElementById('ap-date').value = a.date;
        document.getElementById('ap-time').value = a.time;
        document.getElementById('ap-type').value = a.type;
        apptFee();
    }, 40);
    openM('modal-appt');
}

function apptFee() {
    const dSel = document.getElementById('ap-doctor');
    const fEl = document.getElementById('ap-fee-info');
    const doc = DOCTORS_FULL.find(d => d.name === dSel.value) || DOCTORS_LIST.find(d => d.name === dSel.value);
    fEl.textContent = doc ? `Consultation Fee: $${doc.fee}` : 'Select a doctor to see fee';
}

function saveAppt() {
    const patient = document.getElementById('ap-patient').value;
    const doctor = document.getElementById('ap-doctor').value;
    const date = document.getElementById('ap-date').value;
    const time = document.getElementById('ap-time').value;
    const type = document.getElementById('ap-type').value;
    let ok = true;
    if (!patient) {
        ferr('ap-patient', 'Select patient');
        ok = false;
    }
    if (!doctor) {
        ferr('ap-doctor', 'Select doctor');
        ok = false;
    }
    if (!date) {
        ferr('ap-date', 'Select date');
        ok = false;
    }
    if (!time) {
        ferr('ap-time', 'Select time');
        ok = false;
    }
    if (!ok) return;
    const dup = appointments.find((a, idx) => a.doctor === doctor && a.date === date && a.time === time && idx !== editApptIdx);
    if (dup) { toast(`${doctor} already has an appointment at that time`, 'warning'); return; }
    const doc = DOCTORS_FULL.find(d => d.name === doctor);
    const entry = { patient, doctor, date, time, type, status: 'Confirmed', fee: doc ? doc.fee : 0 };
    if (editApptIdx === -1) {
        entry.id = 'A' + String(appointments.length + 1).padStart(3, '0');
        entry.created = new Date().toISOString();
        appointments.push(entry);
        logAct(`Appointment for ${patient}`, 'teal');
        toast('Appointment booked!', 'success');
    } else {
        entry.id = appointments[editApptIdx].id;
        entry.created = appointments[editApptIdx].created;
        entry.status = appointments[editApptIdx].status;
        appointments[editApptIdx] = entry;
        editApptIdx = -1;
        logAct(`Appointment updated for ${patient}`, 'orange');
        toast('Appointment updated!', 'success');
    }
    saveAll();
    closeM('modal-appt');
    renderAppts();
    renderDash();
}

function renderAppts(q = '') {
    const tbl = document.getElementById('apptTable');
    if (!tbl) return;
    const list = q ? appointments.filter(a => a.patient.toLowerCase().includes(q.toLowerCase()) || a.doctor.toLowerCase().includes(q.toLowerCase())) : appointments;
    if (!list.length) { tbl.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="fas fa-calendar-times"></i><p>No appointments</p></div></td></tr>`; return; }
    const sc = { 'Confirmed': 'b-green', 'Pending': 'b-orange', 'Cancelled': 'b-red', 'Completed': 'b-teal' };
    tbl.innerHTML = list.map(a => { const ri = appointments.indexOf(a); return `
  <tr>
    <td><span class="badge b-teal mono">${a.id}</span></td>
    <td class="fw7">${a.patient}</td>
    <td><span class="badge b-blue" style="font-size:.68rem">${a.doctor}</span></td>
    <td>${fmtDate(a.date)}</td>
    <td class="mono fw7" style="color:var(--teal)">${a.time}</td>
    <td><span class="badge b-gray">${a.type}</span></td>
    <td class="fw7" style="color:var(--green)">$${a.fee||0}</td>
    <td><span class="badge ${sc[a.status]||'b-gray'}">${a.status}</span></td>
    <td><div class="flex gap4">
      <button class="btn btn-warning btn-sm" onclick="editApptFn(${ri})" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn btn-secondary btn-sm" onclick="cycleAppt(${ri})" title="Change Status"><i class="fas fa-sync-alt"></i></button>
      <button class="btn btn-danger btn-sm" onclick="delAppt(${ri})"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`; }).join('');
}

function cycleAppt(i) {
    const c = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    appointments[i].status = c[(c.indexOf(appointments[i].status) + 1) % c.length];
    saveAll();
    renderAppts();
    renderDash();
    toast(`Status → ${appointments[i].status}`, 'info');
}

function delAppt(i) {
    if (confirm('Delete appointment?')) {
        appointments.splice(i, 1);
        saveAll();
        renderAppts();
        renderDash();
        toast('Deleted', 'error');
    }
}

function fmtDate(s) { if (!s) return '—'; return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }

/* ═══════════════════════════════════════════
   DOCTORS
═══════════════════════════════════════════ */
function buildDocFilter() {
    const sel = document.getElementById('docFilter');
    if (!sel) return;
    const specs = [...new Set(DOCTORS_FULL.map(d => d.specialty))].sort();
    sel.innerHTML = `<option value="">All (${DOCTORS_FULL.length})</option>` + specs.map(s => `<option value="${s}">${s}</option>`).join('');
}

function renderDoctors(spec = '', q = '') {
    const grid = document.getElementById('docGrid');
    if (!grid) return;
    let list = DOCTORS_FULL;
    if (spec) list = list.filter(d => d.specialty === spec);
    if (q) {
        const lq = q.toLowerCase();
        list = list.filter(d => d.name.toLowerCase().includes(lq) || d.specialty.toLowerCase().includes(lq));
    }
    if (!list.length) { grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-user-md"></i><p>No doctors found</p></div>`; return; }
    grid.innerHTML = list.map(d => {
        const c = SPEC_CLR[d.specialty] || '#00b4d8';
        const ini = d.name.split(' ').map(n => n[0]).join('').slice(0, 2);
        let stars = '';
        for (let i = 0; i < Math.floor(d.rating); i++) stars += '<i class="fas fa-star"></i>';
        return `
    <div class="doc-card" onclick="showDocProfile('${d.id}')">
      <div class="doc-banner" style="background:linear-gradient(135deg,${c}22,${c}08)">
        <span class="doc-status ${d.status==='available'?'ds-avail':'ds-busy'}"><span class="ds-dot"></span>${d.status==='available'?'Available':'Busy'}</span>
        <span style="font-size:.65rem;color:var(--text3);font-family:monospace">${d.id}</span>
      </div>
      <div class="doc-body">
        <div class="doc-av-wrap">
          <img src="${d.img}" alt="${d.name}" class="doc-av" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="doc-av-fb" style="background:linear-gradient(135deg,${c},${c}99)">${ini}</div>
        </div>
        <span class="doc-spec" style="background:${c}18;color:${c};border:1px solid ${c}30">${d.specialty}</span>
        <div class="doc-name">${d.name}</div>
        <div class="doc-stars">${stars}<span style="color:var(--text2);font-size:.73rem;margin-left:3px">${d.rating}</span></div>
        <div class="doc-meta">
          <span><i class="fas fa-briefcase-medical" style="color:${c}"></i>${d.exp}</span>
          <span><i class="fas fa-users" style="color:${c}"></i>${d.pts.toLocaleString()}</span>
          <span style="color:var(--green)"><i class="fas fa-dollar-sign" style="color:var(--green)"></i>${d.fee}</span>
        </div>
        <p class="doc-desc">${d.desc}</p>
        <div class="doc-phone"><i class="fas fa-phone" style="color:${c}"></i>${d.phone}</div>
        <div class="doc-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-sm" onclick="showDocProfile('${d.id}')"><i class="fas fa-id-card"></i> Profile</button>
          <button class="btn btn-sm" style="flex:1;background:${c};color:#fff;border:none;justify-content:center;font-weight:700" onclick="bookWithDoc('${d.name}')"><i class="fas fa-calendar-plus"></i> Book</button>
        </div>
      </div>
    </div>`;
    }).join('');
}

function showDocProfile(id) {
    const d = DOCTORS_FULL.find(x => x.id === id);
    if (!d) return;
    const c = SPEC_CLR[d.specialty] || '#00b4d8';
    const ini = d.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    let stars = '';
    for (let i = 0; i < Math.floor(d.rating); i++) stars += `<i class="fas fa-star" style="color:#f59e0b"></i>`;
    document.getElementById('docProfileContent').innerHTML = `
  <div style="text-align:center;padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--border)">
    <div style="position:relative;display:inline-block;margin-bottom:12px">
      <img src="${d.img}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid ${c};box-shadow:0 0 0 6px ${c}18" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div style="display:none;width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,${c},${c}88);align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#fff;border:4px solid ${c}">${ini}</div>
      <span style="position:absolute;bottom:4px;right:4px;width:16px;height:16px;border-radius:50%;background:${d.status==='available'?'#10b981':'#ef4444'};border:3px solid var(--surface)"></span>
    </div>
    <div style="background:${c}18;color:${c};border:1px solid ${c}30;padding:3px 14px;border-radius:20px;font-size:.7rem;font-weight:700;display:inline-block;margin-bottom:8px">${d.specialty}</div>
    <h3 style="margin:0 0 2px;font-size:1.15rem;font-weight:800">${d.name}</h3>
    <div style="font-size:.77rem;color:var(--text3)">${d.id} · ${d.status==='available'?'<span style="color:#10b981">● Available</span>':'<span style="color:#ef4444">● Busy</span>'}</div>
    <div style="margin-top:8px">${stars}</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
    ${[['Experience',d.exp,c],['Patients',d.pts.toLocaleString(),c],['Rating',d.rating+'★',c],['Fee','$'+d.fee,'#10b981']].map(([l,v,col])=>`
    <div style="background:var(--surface2);border-radius:10px;padding:10px;text-align:center">
      <div style="font-size:1rem;font-weight:800;color:${col}">${v}</div>
      <div style="font-size:.67rem;color:var(--text3);margin-top:2px">${l}</div>
    </div>`).join('')}
  </div>
  <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:12px">
    <p style="font-size:.85rem;color:var(--text2);line-height:1.6;margin:0">${d.desc}</p>
  </div>
  <div style="background:var(--surface2);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;margin-bottom:16px">
    <i class="fas fa-phone" style="color:${c}"></i><span style="font-size:.85rem;font-weight:600">${d.phone}</span>
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn btn-secondary" style="flex:1" onclick="closeM('modal-doc-profile')">Close</button>
    <button class="btn btn-primary" style="flex:2;background:${c};border-color:${c}" onclick="bookWithDoc('${d.name}');closeM('modal-doc-profile')">
      <i class="fas fa-calendar-plus"></i> Book — $${d.fee}
    </button>
  </div>`;
  openM('modal-doc-profile');
}
function bookWithDoc(docName) {
  go('appointments',null);
  setTimeout(()=>openApptModal(docName),100);
}

/* ═══════════════════════════════════════════
   LABORATORY
═══════════════════════════════════════════ */
function openLabModal(idx=-1) {
  editLabIdx=idx;
  document.getElementById('lab-modal-title').textContent=idx===-1?'Add Lab Test':'Edit Lab Test';
  if(idx===-1){
    document.getElementById('lab-test').value='';
    document.getElementById('lab-result').value='—';
    document.getElementById('lab-status').value='Pending';
    document.getElementById('lab-date').value=new Date().toISOString().split('T')[0];
  } else {
    const t=labTests[idx];
    document.getElementById('lab-test').value=t.test;
    document.getElementById('lab-result').value=t.result;
    document.getElementById('lab-status').value=t.status;
    document.getElementById('lab-date').value=t.date;
    setTimeout(()=>{document.getElementById('lab-patient').value=t.patient;document.getElementById('lab-doctor').value=t.doctor;},40);
  }
  fillSelects();
  openM('modal-lab');
}
function saveLab() {
  const test=document.getElementById('lab-test').value.trim();
  const patient=document.getElementById('lab-patient').value;
  const doctor=document.getElementById('lab-doctor').value;
  if(!test){toast('Enter test name','warning');return;}
  if(!patient){toast('Select patient','warning');return;}
  const entry={
    id:editLabIdx===-1?'L'+String(labTests.length+1).padStart(3,'0'):labTests[editLabIdx].id,
    test,patient,doctor,
    result:document.getElementById('lab-result').value,
    status:document.getElementById('lab-status').value,
    date:document.getElementById('lab-date').value||new Date().toISOString().split('T')[0],
  };
  if(editLabIdx===-1)labTests.push(entry);
  else labTests[editLabIdx]=entry;
  editLabIdx=-1;saveAll();closeM('modal-lab');renderLab();logAct(`Lab test "${test}"`,'blue');toast(editLabIdx===-1?'Test added!':'Test updated!','success');
}
function renderLab(q='') {
  const tbl=document.getElementById('labTable');if(!tbl)return;
  const list=q?labTests.filter(t=>t.test.toLowerCase().includes(q.toLowerCase())||t.patient.toLowerCase().includes(q.toLowerCase())):labTests;
  if(!list.length){tbl.innerHTML=`<tr><td colspan="8"><div class="empty-state"><i class="fas fa-flask"></i><p>No tests</p></div></td></tr>`;return;}
  const rc={'Normal':'b-green','High':'b-red','Low':'b-orange','—':'b-gray'};
  const sc={'Completed':'b-teal','Pending':'b-orange','Processing':'b-blue'};
  tbl.innerHTML=list.map(t=>{const ri=labTests.indexOf(t);return`
  <tr>
    <td><span class="badge b-teal mono">${t.id}</span></td>
    <td class="fw7"><i class="fas fa-flask" style="color:var(--blue);margin-right:6px"></i>${t.test}</td>
    <td>${t.patient}</td>
    <td><span class="badge b-blue" style="font-size:.68rem">${t.doctor}</span></td>
    <td><span class="badge ${rc[t.result]||'b-gray'}">${t.result}</span></td>
    <td><span class="badge ${sc[t.status]||'b-gray'}">${t.status}</span></td>
    <td>${fmtDate(t.date)}</td>
    <td><div class="flex gap4">
      <button class="btn btn-warning btn-sm" onclick="openLabModal(${ri})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="delLab(${ri})"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`;}).join('');
}
function delLab(i){if(confirm('Delete test?')){labTests.splice(i,1);saveAll();renderLab();toast('Deleted','error');}}

/* ═══════════════════════════════════════════
   ROOMS
═══════════════════════════════════════════ */
function openAddRoomModal() {
  editRoomIdx=-1;
  document.getElementById('rm-number').value='';
  document.getElementById('rm-type').selectedIndex=0;
  document.getElementById('rm-status').value='available';
  document.getElementById('rm-patient').value='';
  document.getElementById('rm-notes').value='';
  document.getElementById('rm-del-btn').style.display='none';
  openM('modal-room');
}
function openRoomModal(i) {
  editRoomIdx=i;const r=rooms[i];
  document.getElementById('rm-number').value=r.number;
  document.getElementById('rm-type').value=r.type;
  document.getElementById('rm-status').value=r.status;
  fillSelects(); setTimeout(()=>{ document.getElementById('rm-patient').value=r.patient||''; },40);
  document.getElementById('rm-notes').value=r.notes||'';
  document.getElementById('rm-del-btn').style.display='inline-flex';
  openM('modal-room');
}
function saveRoom() {
  const num=document.getElementById('rm-number').value.trim();
  if(!num){toast('Enter room number','warning');return;}
  const entry={
    id:editRoomIdx===-1?rooms.length:rooms[editRoomIdx].id,
    number:num,
    type:document.getElementById('rm-type').value,
    status:document.getElementById('rm-status').value,
    patient:document.getElementById('rm-patient').value.trim(),
    notes:document.getElementById('rm-notes').value.trim(),
  };
  if(editRoomIdx===-1)rooms.push(entry);
  else rooms[editRoomIdx]=entry;
  editRoomIdx=-1;saveAll();closeM('modal-room');renderRooms();toast('Room saved!','success');
}
function deleteRoom() {
  if(editRoomIdx===-1)return;
  if(confirm(`Delete room ${rooms[editRoomIdx].number}?`)){
    rooms.splice(editRoomIdx,1);editRoomIdx=-1;saveAll();closeM('modal-room');renderRooms();toast('Room deleted','error');
  }
}
function renderRooms() {
  const grid=document.getElementById('roomsGrid');
  const stats=document.getElementById('roomStats');
  if(!grid)return;
  const avail=rooms.filter(r=>r.status==='available').length;
  const occup=rooms.filter(r=>r.status==='occupied').length;
  const maint=rooms.filter(r=>r.status==='maintenance').length;
  if(stats)stats.innerHTML=`
    <div class="rs-pill rp-green"><i class="fas fa-circle" style="font-size:.5rem"></i>Available <strong>${avail}</strong></div>
    <div class="rs-pill rp-red"><i class="fas fa-circle" style="font-size:.5rem"></i>Occupied <strong>${occup}</strong></div>
    <div class="rs-pill rp-orange"><i class="fas fa-circle" style="font-size:.5rem"></i>Maintenance <strong>${maint}</strong></div>`;
  const icons={General:'fa-bed',ICU:'fa-heartbeat',Surgery:'fa-cut',Private:'fa-star',Emergency:'fa-bolt'};
  grid.innerHTML=rooms.map((r,i)=>`
  <div class="room-card rc-${r.status}" onclick="openRoomModal(${i})" title="Click to edit">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
      <span class="room-num">${r.number}</span>
      <i class="fas ${icons[r.type]||'fa-bed'}" style="font-size:.8rem;opacity:.55"></i>
    </div>
    <div class="room-type">${r.type}</div>
    ${r.patient?`<div style="font-size:.62rem;color:var(--text2);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.patient}</div>`:''}
    <div class="room-dot"></div>
  </div>`).join('');
}

/* ═══════════════════════════════════════════
   STAFF
═══════════════════════════════════════════ */
function renderStaff(q='') {
  const grid=document.getElementById('staffGrid');if(!grid)return;
  const list=q?staffList.filter(s=>s.name.toLowerCase().includes(q.toLowerCase())||s.role.toLowerCase().includes(q.toLowerCase())||s.dept.toLowerCase().includes(q.toLowerCase())):staffList;
  if(!list.length){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-id-badge"></i><p>No staff found</p></div>';return;}
  grid.innerHTML=list.map(s=>`
  <div class="staff-card" onclick="showStaffProfile('${s.id}')">
    <div class="staff-bar" style="background:${s.color}"></div>
    <div class="staff-inner">
      <div style="position:relative">
<div style="text-align:center;margin-bottom:12px">
  <img src="${s.img || 'https://via.placeholder.com/80'}"
       style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:4px solid ${s.color}30;">
</div>        <span class="staff-av-dot ${s.status==='active'?'sad-active':'sad-inactive'}"></span>
      </div>
      <div class="staff-info">
        <div class="staff-name">${s.name}</div>
        <div class="staff-role" style="color:${s.color}">${s.role}</div>
        <div class="staff-dept"><i class="fas fa-building" style="font-size:.6rem;margin-right:3px"></i>${s.dept}</div>
      </div>
      <div class="staff-sal"><div class="amt">$${s.salary.toLocaleString()}</div><div class="lbl">/month</div></div>
    </div>
  </div>`).join('');
}
function showStaffProfile(id) {
  const s=staffList.find(x=>x.id===id);if(!s)return;
  const joined=new Date(s.joined);const years=Math.floor((new Date()-joined)/(365.25*24*3600*1000));
  document.getElementById('staffProfileContent').innerHTML=`
  <div style="text-align:center;padding-bottom:18px;margin-bottom:18px;border-bottom:1px solid var(--border)">
    <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${s.color},${s.color}88);display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#fff;border:4px solid ${s.color}30;box-shadow:0 0 0 6px ${s.color}12;margin-bottom:12px">
      ${s.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
    </div>
    <div style="background:${s.color}18;color:${s.color};border:1px solid ${s.color}30;padding:3px 14px;border-radius:20px;font-size:.7rem;font-weight:700;display:inline-block;margin-bottom:8px">${s.role}</div>
    <h3 style="margin:0 0 3px;font-size:1.1rem;font-weight:800">${s.name}</h3>
    <div style="font-size:.77rem;color:var(--text3)">${s.dept}</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
    ${[['Employee ID',s.id,'#64748b'],['Department',s.dept,s.color],['Years',years+' yrs','#10b981'],['Salary','$'+s.salary.toLocaleString(),'#f59e0b'],['Status',s.status==='active'?'✅ Active':'❌ Inactive',s.status==='active'?'#10b981':'#ef4444'],['Joined',new Date(s.joined).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),'#6366f1']].map(([l,v,c])=>`
    <div style="background:var(--surface2);border-radius:10px;padding:11px">
      <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--text3);margin-bottom:3px">${l}</div>
      <div style="font-weight:700;color:${c};font-size:.85rem">${v}</div>
    </div>`).join('')}
  </div>
  <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:14px">
    <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--text3);margin-bottom:8px">Contact</div>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;align-items:center;gap:9px;font-size:.83rem"><i class="fas fa-phone" style="color:${s.color};width:14px"></i>${s.phone}</div>
      <div style="display:flex;align-items:center;gap:9px;font-size:.83rem"><i class="fas fa-envelope" style="color:${s.color};width:14px"></i>${s.email}</div>
    </div>
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn btn-secondary" style="flex:1" onclick="closeM('modal-staff')">Close</button>
    <button class="btn btn-warning"   style="flex:1" onclick="openEditStaff('${s.id}');closeM('modal-staff')"><i class="fas fa-edit"></i> Edit</button>
    <button class="btn btn-primary"   style="flex:1;background:${s.color};border-color:${s.color}"><i class="fas fa-envelope"></i> Contact</button>
  </div>`;
  openM('modal-staff');
}


/* ─── STAFF EDIT ────────────────────────────────────────────── */
function openEditStaff(id) {
  const i = staffList.findIndex(x=>x.id===id);
  if(i===-1)return;
  editStaffIdx=i; const s=staffList[i];
  document.getElementById('sf-name').value   = s.name;
  document.getElementById('sf-role').value   = s.role;
  document.getElementById('sf-dept').value   = s.dept;
  document.getElementById('sf-salary').value = s.salary;
  document.getElementById('sf-phone').value  = s.phone;
  document.getElementById('sf-email').value  = s.email;
  document.getElementById('sf-img').value    = s.img||'';
  document.getElementById('sf-status').value = s.status;
  openM('modal-staff-edit');
}
function saveStaff() {
  if(editStaffIdx===-1)return;
  const s=staffList[editStaffIdx];
  const name=document.getElementById('sf-name').value.trim();
  if(name)s.name=name;
  s.role   = document.getElementById('sf-role').value.trim()   || s.role;
  s.dept   = document.getElementById('sf-dept').value.trim()   || s.dept;
  s.salary = parseFloat(document.getElementById('sf-salary').value) || s.salary;
  s.phone  = document.getElementById('sf-phone').value.trim()  || s.phone;
  s.email  = document.getElementById('sf-email').value.trim()  || s.email;
  s.img    = document.getElementById('sf-img').value.trim();
  s.status = document.getElementById('sf-status').value;
  editStaffIdx=-1;
  saveAll();
  closeM('modal-staff-edit');
  renderStaff();
  toast('Staff updated!','success');
}

/* ═══════════════════════════════════════════
   RECEPTION
═══════════════════════════════════════════ */
function renderReception() {
  const today=new Date().toISOString().split('T')[0];
  const todayA=appointments.filter(a=>a.date===today);
  const checked=appointments.filter(a=>a.status==='Completed').length;
  const pend=appointments.filter(a=>a.status==='Pending').length;
  const stats=document.getElementById('recStats');
  if(stats)stats.innerHTML=`
    <div class="rec-stat"><i class="fas fa-calendar-day" style="color:var(--teal)"></i><div><strong>${todayA.length}</strong><span>Today</span></div></div>
    <div class="rec-stat"><i class="fas fa-check-circle" style="color:var(--green)"></i><div><strong>${checked}</strong><span>Checked In</span></div></div>
    <div class="rec-stat"><i class="fas fa-clock" style="color:var(--orange)"></i><div><strong>${pend}</strong><span>Pending</span></div></div>
    <div class="rec-stat"><i class="fas fa-list" style="color:var(--purple)"></i><div><strong>${appointments.length}</strong><span>Total</span></div></div>`;
  const queue=appointments.filter(a=>a.date>=today).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).slice(0,12);
  const qEl=document.getElementById('recQueue');
  if(qEl)qEl.innerHTML=queue.length===0?`<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No upcoming</p></div>`:
    queue.map(a=>{const ini=a.patient.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();const isT=a.date===today;return`
    <div class="queue-item">
      <div class="q-av" style="background:linear-gradient(135deg,${isT?'#00b4d8':'#64748b'},${isT?'#0077cc':'#475569'})">${ini}</div>
      <div class="q-info">
        <div class="q-name">${a.patient}</div>
        <div class="q-meta"><i class="fas fa-user-md" style="color:var(--teal)"></i> ${a.doctor} &nbsp;·&nbsp; ${isT?a.time:fmtDate(a.date)+' '+a.time} &nbsp;·&nbsp; <span style="color:var(--green);font-weight:600">$${a.fee||0}</span></div>
      </div>
      <div class="q-actions">
        <span class="badge ${a.status==='Confirmed'?'b-green':a.status==='Completed'?'b-teal':a.status==='Cancelled'?'b-red':'b-orange'}">${a.status}</span>
        ${a.status!=='Completed'&&a.status!=='Cancelled'?`<button class="btn btn-primary btn-sm" onclick="checkIn('${a.id}')"><i class="fas fa-sign-in-alt"></i> Check In</button>`:''}
      </div>
    </div>`;}).join('');
  const cEl=document.getElementById('recCheckins');
  const done=appointments.filter(a=>a.date===today&&a.status==='Completed');
  if(cEl)cEl.innerHTML=done.length===0?'<div class="text-muted text-sm" style="padding:8px">None yet</div>':
    done.map(a=>`<div class="activity-item"><div class="act-dot" style="background:var(--teal)"></div><div class="act-info"><strong>${a.patient}</strong><span>${a.doctor} · ${a.time}</span></div><span class="badge b-teal">✓ Done</span></div>`).join('');
}
function checkIn(id){const a=appointments.find(x=>x.id===id);if(a){a.status='Completed';saveAll();renderReception();renderDash();toast(`${a.patient} checked in!`,'success');}}

/* ═══════════════════════════════════════════
   INVOICES
═══════════════════════════════════════════ */
function generateInvoice() {
  const patient=document.getElementById('inv-pt').value;
  const med=parseFloat(document.getElementById('inv-med').value)||0;
  const room=parseFloat(document.getElementById('inv-room').value)||0;
  const doc=parseFloat(document.getElementById('inv-doc').value)||0;
  const oth=parseFloat(document.getElementById('inv-oth').value)||0;
  const notes=document.getElementById('inv-notes').value.trim();
  if(!patient){toast('Select patient','warning');return;}
  if(med+room+doc+oth===0){toast('Enter at least one cost','warning');return;}
  const sub=med+room+doc+oth,tax=+(sub*.05).toFixed(2),total=+(sub+tax).toFixed(2);
  const inv={id:'INV'+String(invoices.length+1).padStart(3,'0'),patient,medicine:med,room,doctor:doc,other:oth,subtotal:sub,tax,total,notes,date:new Date().toLocaleDateString('en-GB'),created:new Date().toISOString()};
  invoices.push(inv);currentInvoice=inv;saveAll();renderInvPreview(inv);renderInvTable();renderDash();logAct(`Invoice for ${patient}`,'green');toast(`Invoice ${inv.id} created!`,'success');
}
function renderInvPreview(inv) {
  document.getElementById('invPreview').innerHTML=`
  <div id="invPrintArea">
    <div class="inv-top">
      <div class="inv-brand"><strong>Al-Hayat Hospital</strong><span>Healthcare Excellence</span><div style="font-size:.72rem;color:var(--text3);margin-top:4px"><i class="fas fa-phone"></i> +966 11 000 0000</div></div>
      <div class="inv-badge"><strong>INVOICE</strong><span>${inv.id}</span></div>
    </div>
    <div class="inv-meta">
      <div><div style="font-size:.72rem;color:var(--text3);margin-bottom:4px">Bill To:</div><strong>${inv.patient}</strong></div>
      <div style="text-align:right"><div style="font-size:.8rem">Date: <strong>${inv.date}</strong></div><div style="font-size:.8rem;margin-top:4px">Status: <strong style="color:var(--green)">PAID</strong></div></div>
    </div>
    <table class="inv-tbl">
      <thead><tr><th style="width:60%">Service</th><th>Qty</th><th>Amount</th></tr></thead>
      <tbody>
        ${inv.medicine>0?`<tr><td><i class="fas fa-pills" style="color:var(--blue);margin-right:8px"></i>Medicines</td><td>1</td><td>$${inv.medicine.toFixed(2)}</td></tr>`:''}
        ${inv.room>0?`<tr><td><i class="fas fa-bed" style="color:var(--purple);margin-right:8px"></i>Room & Board</td><td>1</td><td>$${inv.room.toFixed(2)}</td></tr>`:''}
        ${inv.doctor>0?`<tr><td><i class="fas fa-user-md" style="color:var(--green);margin-right:8px"></i>Doctor Consultation</td><td>1</td><td>$${inv.doctor.toFixed(2)}</td></tr>`:''}
        ${inv.other>0?`<tr><td><i class="fas fa-plus-circle" style="color:var(--orange);margin-right:8px"></i>Other</td><td>1</td><td>$${inv.other.toFixed(2)}</td></tr>`:''}
      </tbody>
    </table>
    <div class="inv-totals">
      <div class="inv-total-row"><span>Subtotal</span><strong>$${inv.subtotal.toFixed(2)}</strong></div>
      <div class="inv-total-row"><span>VAT 5%</span><strong>$${inv.tax.toFixed(2)}</strong></div>
      <div class="inv-grand"><span>Total</span><strong>$${inv.total.toFixed(2)}</strong></div>
    </div>
    ${inv.notes?`<div style="margin-top:14px;padding:10px;background:var(--surface2);border-radius:8px;font-size:.78rem;color:var(--text3)"><strong>Notes:</strong> ${inv.notes}</div>`:''}
    <div style="text-align:center;margin-top:14px;font-size:.7rem;color:var(--text3);border-top:1px solid var(--border);padding-top:10px">Thank you for choosing Al-Hayat Hospital. Get well soon!</div>
  </div>`;
}
function renderInvTable() {
  const tbl=document.getElementById('invTable');if(!tbl)return;
  if(!invoices.length){tbl.innerHTML=`<tr><td colspan="6"><div class="empty-state"><i class="fas fa-file-invoice"></i><p>No invoices</p></div></td></tr>`;return;}
  tbl.innerHTML=[...invoices].reverse().map(inv=>{const ri=invoices.indexOf(inv);return`
  <tr>
    <td><span class="badge b-teal mono">${inv.id}</span></td>
    <td class="fw7">${inv.patient}</td>
    <td>${inv.date}</td>
    <td class="fw7" style="color:var(--green)">$${inv.total.toFixed(2)}</td>
    <td><span class="badge b-green">Paid</span></td>
    <td><div class="flex gap4">
      <button class="btn btn-secondary btn-sm" onclick="viewInv(${ri})"><i class="fas fa-eye"></i></button>
      <button class="btn btn-primary btn-sm" onclick="printOne(${ri})"><i class="fas fa-print"></i></button>
      <button class="btn btn-danger btn-sm" onclick="delInv(${ri})"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`;}).join('');
}
function viewInv(i){currentInvoice=invoices[i];renderInvPreview(invoices[i]);document.getElementById('invPreview')?.scrollIntoView({behavior:'smooth'});}
function printOne(i){currentInvoice=invoices[i];renderInvPreview(invoices[i]);setTimeout(()=>window.print(),100);}
function printInv(){
  if(!currentInvoice){toast('Generate an invoice first','warning');return;}
  const w=window.open('','_blank','width=800,height=700');
  const inv=currentInvoice;
  w.document.write(`<!DOCTYPE html><html><head>
    <title>Invoice ${inv.id} — Al-Hayat Hospital</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:36px;color:#0f172a;background:#fff;max-width:680px;margin:0 auto}
      .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #00b4d8}
      .brand strong{font-size:1.2rem;font-weight:800;display:block}
      .brand span,.brand div{font-size:.78rem;color:#64748b;line-height:1.7}
      .inv-label{text-align:right}
      .inv-label strong{font-size:1.8rem;font-weight:900;color:#00b4d8;display:block;letter-spacing:3px}
      .inv-label span{font-size:.78rem;color:#64748b;font-family:monospace}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#f1f5f9;padding:10px 14px;text-align:left;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b}
      td{padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:.83rem}
      .totals{margin-left:auto;width:260px}
      .tr{display:flex;justify-content:space-between;padding:5px 0;font-size:.83rem;color:#64748b}
      .grand{display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #00b4d8;font-size:1rem;font-weight:800;color:#0f172a;margin-top:4px}
      footer{text-align:center;margin-top:20px;font-size:.7rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}
    </style>
  </head><body>
    <div class="top">
      <div class="brand"><strong>Al-Hayat Hospital</strong><span>Healthcare Excellence</span><div>📍 Main Medical District, City &nbsp;|&nbsp; 📞 +966 11 000 0000</div></div>
      <div class="inv-label"><strong>INVOICE</strong><span>${inv.id}</span></div>
    </div>
    <div class="meta">
      <div><div style="font-size:.7rem;color:#94a3b8;margin-bottom:3px">Bill To:</div><strong style="font-size:1rem">${inv.patient}</strong></div>
      <div style="text-align:right"><div>Date: <strong>${inv.date}</strong></div><div style="color:#10b981;font-weight:700;margin-top:4px">✓ PAID</div></div>
    </div>
    <table>
      <thead><tr><th style="width:60%">Service</th><th>Qty</th><th>Amount</th></tr></thead>
      <tbody>
        ${inv.medicine>0?`<tr><td>💊 Medicines & Pharmacy</td><td>1</td><td>$${inv.medicine.toFixed(2)}</td></tr>`:''}
        ${inv.room>0?`<tr><td>🛏️ Room & Board</td><td>1</td><td>$${inv.room.toFixed(2)}</td></tr>`:''}
        ${inv.doctor>0?`<tr><td>👨‍⚕️ Doctor Consultation</td><td>1</td><td>$${inv.doctor.toFixed(2)}</td></tr>`:''}
        ${inv.other>0?`<tr><td>➕ Other Services</td><td>1</td><td>$${inv.other.toFixed(2)}</td></tr>`:''}
      </tbody>
    </table>
    <div class="totals">
      <div class="tr"><span>Subtotal</span><strong>$${inv.subtotal.toFixed(2)}</strong></div>
      <div class="tr"><span>VAT (5%)</span><strong>$${inv.tax.toFixed(2)}</strong></div>
      <div class="grand"><span>Total Amount</span><strong>$${inv.total.toFixed(2)}</strong></div>
    </div>
    ${inv.notes?`<div style="margin-top:14px;padding:10px;background:#f8fafc;border-radius:6px;font-size:.78rem;color:#64748b"><strong>Notes:</strong> ${inv.notes}</div>`:''}
    <footer>Thank you for choosing Al-Hayat Hospital. Get well soon! ❤</footer>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800);}<\/script>
  </body></html>`);
  w.document.close();
}
function delInv(i){if(confirm('Delete invoice?')){invoices.splice(i,1);saveAll();renderInvTable();renderDash();toast('Deleted','error');}}

/* ═══════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════ */
function renderReports() {
  const byDoc={};patients.forEach(p=>{byDoc[p.doctor]=(byDoc[p.doctor]||0)+1;});
  const el=document.getElementById('repDocs');
  if(el)el.innerHTML=patients.length===0?'<p class="text-muted text-sm">No data</p>':
    Object.entries(byDoc).map(([d,c])=>`
    <div style="margin-bottom:14px">
      <div class="flex gap8" style="justify-content:space-between;margin-bottom:5px">
        <span style="font-size:.82rem;font-weight:700">${d}</span>
        <span class="text-muted text-sm">${c} pts</span>
      </div>
      <div class="prog-wrap"><div class="prog-fill" style="width:${Math.round(c/patients.length*100)}%"></div></div>
    </div>`).join('');
  const rev=invoices.reduce((s,i)=>s+i.total,0);
  const el2=document.getElementById('repRev');if(el2)el2.textContent='$'+rev.toFixed(2);
  const rp=document.getElementById('repP');if(rp)rp.textContent=patients.length;
  const ra=document.getElementById('repA');if(ra)ra.textContent=appointments.length;
  const ctx=document.getElementById('repChart');
  if(ctx){
    if(repChartInst)repChartInst.destroy();
    repChartInst=new Chart(ctx,{type:'doughnut',data:{labels:['Medicine','Room','Doctor','Other'],datasets:[{data:[invoices.reduce((s,i)=>s+i.medicine,0),invoices.reduce((s,i)=>s+i.room,0),invoices.reduce((s,i)=>s+i.doctor,0),invoices.reduce((s,i)=>s+i.other,0)],backgroundColor:['#3b82f6','#8b5cf6','#10b981','#f59e0b'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,cutout:'70%',plugins:{legend:{position:'bottom',labels:{color:'#64748b',font:{size:12},padding:16,usePointStyle:true}}}}});
  }
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  if(localStorage.getItem('hms5_dark')==='true'){
    document.body.classList.add('dark');
    document.getElementById('darkIcon').className='fas fa-sun';
  }
  renderDash();
  buildDocFilter();
  fillSelects();
});
/* ═══════════════════════════════════════════
   FIX: INVOICE PATIENT AUTOCOMPLETE
═══════════════════════════════════════════ */
function setupInvPatientSearch() {
  const inp = document.getElementById('inv-pt-input');
  const hid = document.getElementById('inv-pt');
  const drop = document.getElementById('inv-pt-dropdown');
  if (!inp || !hid || !drop) return;

  inp.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    hid.value = '';
    if (!q) { drop.style.display='none'; return; }
    const matches = patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.id||'').toLowerCase().includes(q) ||
      (p.phone||'').includes(q)
    );
    if (!matches.length) { drop.style.display='none'; return; }
    drop.innerHTML = matches.slice(0,8).map(p => `
      <div class="inv-pt-opt" data-name="${p.name}" data-id="${p.id}">
        <strong>${p.name}</strong>
        <span style="color:var(--text3);font-size:.75rem;margin-left:8px">${p.id} · ${p.phone}</span>
      </div>`).join('');
    drop.style.display = 'block';
    drop.querySelectorAll('.inv-pt-opt').forEach(opt => {
      opt.addEventListener('mousedown', function(e) {
        e.preventDefault();
        inp.value = this.dataset.name;
        hid.value = this.dataset.name;
        drop.style.display = 'none';
      });
    });
  });

  inp.addEventListener('blur', function() {
    setTimeout(() => { drop.style.display='none'; }, 200);
    // If typed name not selected from list, use typed value directly
    if (!hid.value && inp.value.trim()) {
      hid.value = inp.value.trim();
    }
  });

  inp.addEventListener('focus', function() {
    if (this.value.trim()) this.dispatchEvent(new Event('input'));
  });
}

/* ═══════════════════════════════════════════
   FIX: ROOM MODAL — patient text input + doctor supervisor
═══════════════════════════════════════════ */
function setupRoomModal() {
  const wrap = document.getElementById('modal-room');
  if (!wrap || wrap.dataset.fixedRoom) return;
  wrap.dataset.fixedRoom = '1';

  // Replace patient select with autocomplete text input
  const patSel = document.getElementById('rm-patient');
  if (patSel) {
    const fg = patSel.closest('.fg') || patSel.parentElement;
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.innerHTML = `
      <input id="rm-patient-inp" placeholder="Type name or ID..." autocomplete="off"
        style="padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;width:100%;font-size:.85rem;font-family:inherit;background:var(--surface);color:var(--text1);outline:none">
      <div id="rm-patient-drop" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--surface);border:1.5px solid var(--teal);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;max-height:160px;overflow-y:auto;margin-top:2px"></div>`;
    patSel.parentElement.replaceChild(wrapper, patSel);
    fg.querySelector('label') && fg.insertBefore(fg.querySelector('label'), wrapper);

    const inp = document.getElementById('rm-patient-inp');
    const drop = document.getElementById('rm-patient-drop');
    inp.addEventListener('input', function() {
      const q = this.value.trim().toLowerCase();
      if (!q) { drop.style.display='none'; return; }
      const matches = patients.filter(p => p.name.toLowerCase().includes(q)||(p.id||'').toLowerCase().includes(q));
      if (!matches.length) { drop.style.display='none'; return; }
      drop.innerHTML = matches.slice(0,6).map(p=>`<div class="inv-pt-opt" data-name="${p.name}">${p.name} <span style="color:var(--text3);font-size:.72rem">${p.id}</span></div>`).join('');
      drop.style.display='block';
      drop.querySelectorAll('.inv-pt-opt').forEach(o=>o.addEventListener('mousedown',function(e){e.preventDefault();inp.value=this.dataset.name;drop.style.display='none';}));
    });
    inp.addEventListener('blur',()=>setTimeout(()=>drop.style.display='none',200));
  }

  // Add doctor supervisor field if not already there
  const modalBody = wrap.querySelector('.modal-body');
  if (modalBody && !document.getElementById('rm-doctor-inp')) {
    const fg = document.createElement('div');
    fg.className = 'fg';
    fg.style.marginTop = '8px';
    fg.innerHTML = `
      <label><i class="fas fa-user-md" style="color:var(--teal);margin-right:6px"></i>Supervising Doctor</label>
      <select id="rm-doctor-inp" class="doctor-sel" style="padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;width:100%;font-size:.85rem;font-family:inherit;background:var(--surface);color:var(--text1)">
        <option value="">-- No assigned doctor --</option>
      </select>`;
    modalBody.insertBefore(fg, modalBody.querySelector('.fg.mt8') || null);
    // Also add it to form-grid
  }
}

/* Override openAddRoomModal & openRoomModal to work with new fields */
const _origOpenAddRoom = openAddRoomModal;
window.openAddRoomModal = function() {
  _origOpenAddRoom();
  setupRoomModal();
  fillSelects();
  const inp = document.getElementById('rm-patient-inp');
  if (inp) inp.value = '';
  const docInp = document.getElementById('rm-doctor-inp');
  if (docInp) docInp.value = '';
};

const _origOpenRoom = openRoomModal;
window.openRoomModal = function(i) {
  _origOpenRoom(i);
  setupRoomModal();
  fillSelects();
  const r = rooms[i];
  const inp = document.getElementById('rm-patient-inp');
  if (inp) inp.value = r.patient || '';
  setTimeout(() => {
    const docInp = document.getElementById('rm-doctor-inp');
    if (docInp) docInp.value = r.doctor || '';
  }, 50);
};

/* Override saveRoom to capture new fields */
const _origSaveRoom = saveRoom;
window.saveRoom = function() {
  const inp = document.getElementById('rm-patient-inp');
  if (inp) {
    const fakeSel = { value: inp.value.trim() };
    // patch: temporarily override getElementById for rm-patient
    const orig = document.getElementById.bind(document);
    document._getRmPat = fakeSel;
  }
  // Patch rooms entry manually
  const num = document.getElementById('rm-number').value.trim();
  if (!num) { toast('Enter room number','warning'); return; }
  const patVal = (document.getElementById('rm-patient-inp') || {value:''}).value.trim();
  const docVal = (document.getElementById('rm-doctor-inp') || {value:''}).value.trim();
  const entry = {
    id: editRoomIdx===-1 ? rooms.length : rooms[editRoomIdx].id,
    number: num,
    type: document.getElementById('rm-type').value,
    status: document.getElementById('rm-status').value,
    patient: patVal,
    doctor: docVal,
    notes: document.getElementById('rm-notes').value.trim(),
  };
  if (editRoomIdx===-1) rooms.push(entry);
  else rooms[editRoomIdx] = entry;
  editRoomIdx=-1; saveAll(); closeM('modal-room'); renderRooms(); toast('Room saved!','success');

  // If patient typed manually and not in system, add them
  if (patVal && !patients.find(p=>p.name.toLowerCase()===patVal.toLowerCase())) {
    if (confirm(`"${patVal}" not found in patients. Add as new patient?`)) {
      const pt = { id:'P'+String(patients.length+1).padStart(3,'0'), name:patVal, age:0, phone:'—', doctor: docVal||'—', blood:'', gender:'', created:new Date().toISOString() };
      patients.push(pt);
      saveAll(); fillSelects();
      toast(`Patient "${patVal}" added!`,'success');
    }
  }
};

/* ═══════════════════════════════════════════
   FIX: LAB — patient autocomplete + patient ID input
═══════════════════════════════════════════ */
function setupLabModal() {
  const wrap = document.getElementById('modal-lab');
  if (!wrap || wrap.dataset.fixedLab) return;
  wrap.dataset.fixedLab = '1';

  const patSel = document.getElementById('lab-patient');
  if (patSel) {
    const parent = patSel.parentElement;
    parent.innerHTML = `
      <label>Patient (name or ID) *</label>
      <div style="position:relative">
        <input id="lab-patient-inp" placeholder="Type name or patient ID..." autocomplete="off"
          style="padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;width:100%;font-size:.85rem;font-family:inherit;background:var(--surface);color:var(--text1);outline:none">
        <input type="hidden" id="lab-patient">
        <div id="lab-patient-drop" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--surface);border:1.5px solid var(--teal);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;max-height:160px;overflow-y:auto;margin-top:2px"></div>
      </div>`;

    const inp = document.getElementById('lab-patient-inp');
    const hid = document.getElementById('lab-patient');
    const drop = document.getElementById('lab-patient-drop');

    inp.addEventListener('input', function() {
      const q = this.value.trim().toLowerCase();
      hid.value = '';
      if (!q) { drop.style.display='none'; return; }
      const matches = patients.filter(p=>p.name.toLowerCase().includes(q)||(p.id||'').toLowerCase().includes(q)||(p.phone||'').includes(q));
      if (!matches.length) { drop.style.display='none'; return; }
      drop.innerHTML = matches.slice(0,6).map(p=>`<div class="inv-pt-opt" data-name="${p.name}">${p.name} <span style="color:var(--text3);font-size:.72rem">${p.id} · ${p.phone}</span></div>`).join('');
      drop.style.display='block';
      drop.querySelectorAll('.inv-pt-opt').forEach(o=>o.addEventListener('mousedown',function(e){e.preventDefault();inp.value=this.dataset.name;hid.value=this.dataset.name;drop.style.display='none';}));
    });
    inp.addEventListener('blur',function(){setTimeout(()=>drop.style.display='none',200); if(!hid.value&&inp.value.trim())hid.value=inp.value.trim();});
  }

  // Add test name suggestions
  const testInp = document.getElementById('lab-test');
  if (testInp && !document.getElementById('lab-test-drop')) {
    const wrap2 = document.createElement('div');
    wrap2.style.position = 'relative';
    testInp.parentNode.insertBefore(wrap2, testInp);
    wrap2.appendChild(testInp);
    const drop2 = document.createElement('div');
    drop2.id = 'lab-test-drop';
    drop2.style.cssText = 'display:none;position:absolute;top:100%;left:0;right:0;background:var(--surface);border:1.5px solid var(--teal);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;max-height:200px;overflow-y:auto;margin-top:2px';
    wrap2.appendChild(drop2);

    const COMMON_TESTS = ['Complete Blood Count (CBC)','Blood Glucose','HbA1c','Lipid Panel','Liver Function Test','Kidney Function Test','Thyroid Panel (TSH, T3, T4)','Urine Analysis','Chest X-Ray','Abdominal Ultrasound','ECG / EKG','MRI Brain','CT Scan Chest','Stool Analysis','Vitamin D Level','Vitamin B12','Iron Studies','Coagulation Profile','COVID-19 PCR','Hepatitis B Surface Antigen'];

    testInp.addEventListener('focus', function() {
      if (!this.value) showTestSuggestions('');
    });
    testInp.addEventListener('input', function() {
      showTestSuggestions(this.value.toLowerCase());
    });

    function showTestSuggestions(q) {
      const filtered = q ? COMMON_TESTS.filter(t=>t.toLowerCase().includes(q)) : COMMON_TESTS;
      if (!filtered.length) { drop2.style.display='none'; return; }
      drop2.innerHTML = filtered.slice(0,10).map(t=>`<div class="inv-pt-opt">${t}</div>`).join('');
      drop2.style.display='block';
      drop2.querySelectorAll('.inv-pt-opt').forEach(o=>o.addEventListener('mousedown',function(e){e.preventDefault();testInp.value=this.textContent;drop2.style.display='none';}));
    }
    testInp.addEventListener('blur',()=>setTimeout(()=>drop2.style.display='none',200));
  }
}

/* Override openLabModal to call setupLabModal */
const _origOpenLab = openLabModal;
window.openLabModal = function(idx=-1) {
  _origOpenLab(idx);
  setupLabModal();
  // restore patient value when editing
  if (idx !== -1) {
    const t = labTests[idx];
    const inp = document.getElementById('lab-patient-inp');
    const hid = document.getElementById('lab-patient');
    if (inp) inp.value = t.patient || '';
    if (hid) hid.value = t.patient || '';
  } else {
    const inp = document.getElementById('lab-patient-inp');
    const hid = document.getElementById('lab-patient');
    if (inp) inp.value = '';
    if (hid) hid.value = '';
  }
};

/* ═══════════════════════════════════════════
   FIX: DOCTOR PROFILE — editable fee + salary (admin view)
═══════════════════════════════════════════ */
const _origShowDocProfile = showDocProfile;
window.showDocProfile = function(id) {
  _origShowDocProfile(id);
  const d = DOCTORS_FULL.find(x=>x.id===id);
  if (!d) return;
  const c = SPEC_CLR[d.specialty]||'#00b4d8';
  // Append admin section to profile
  const content = document.getElementById('docProfileContent');
  if (!content) return;
  const adminSection = document.createElement('div');
  adminSection.style.cssText='border-top:1px solid var(--border);padding-top:14px;margin-top:4px';
  adminSection.innerHTML=`
    <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:10px"><i class="fas fa-lock" style="margin-right:5px;color:${c}"></i>Admin Only — Financial</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div>
        <label style="font-size:.72rem;color:var(--text3);display:block;margin-bottom:5px">Consultation Fee ($)</label>
        <input id="dp-fee" type="number" value="${d.fee}" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:.85rem;background:var(--surface);color:var(--text1)">
      </div>
      <div>
        <label style="font-size:.72rem;color:var(--text3);display:block;margin-bottom:5px">Monthly Salary ($)</label>
        <input id="dp-salary" type="number" value="${d.salary||''}" placeholder="Set salary" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:.85rem;background:var(--surface);color:var(--text1)">
      </div>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:.72rem;color:var(--text3);display:block;margin-bottom:5px">Description / Bio</label>
      <textarea id="dp-desc" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:.82rem;background:var(--surface);color:var(--text1);resize:vertical;min-height:60px">${d.desc}</textarea>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="saveDoctorAdmin('${id}')"><i class="fas fa-save"></i> Save Changes</button>`;
  content.appendChild(adminSection);
};

window.saveDoctorAdmin = function(id) {
  const d = DOCTORS_FULL.find(x=>x.id===id);
  if (!d) return;
  const fee = parseFloat(document.getElementById('dp-fee').value)||d.fee;
  const salary = parseFloat(document.getElementById('dp-salary').value)||0;
  const desc = document.getElementById('dp-desc').value.trim()||d.desc;
  d.fee = fee;
  d.salary = salary;
  d.desc = desc;
  closeM('modal-doc-profile');
  toast(`Dr. ${d.name.split(' ').slice(1).join(' ')} profile updated!`,'success');
};

/* Book appointment from doctor profile — go to appointments tab */
window.bookWithDoc = function(docName) {
  closeM('modal-doc-profile');
  go('appointments',null);
  setTimeout(()=>openApptModal(docName),120);
};

/* ═══════════════════════════════════════════
   FIX: DASHBOARD — fix sd-labs counter
═══════════════════════════════════════════ */
const _origRenderDash = renderDash;
window.renderDash = function() {
  _origRenderDash();
  const el = document.getElementById('sd-labs');
  if (el) el.textContent = labTests.filter(t=>t.status==='Pending').length;
};

/* ═══════════════════════════════════════════
   INIT FIX — wire invoice search on DOMContentLoaded
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setupInvPatientSearch();
});

/* ═══════════════════════════════════════════
   RECEPTION — LIVE CLOCK
═══════════════════════════════════════════ */
function startRecClock() {
  function tick() {
    const now = new Date();
    const cl = document.getElementById('recClock');
    const dt = document.getElementById('recDate');
    if (cl) cl.textContent = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if (dt) dt.textContent = now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  }
  tick();
  setInterval(tick, 1000);
}

// Patch renderReception to update queue badge
const _origRenderReception = renderReception;
window.renderReception = function() {
  _origRenderReception();
  startRecClock();
  setupInvPatientSearch();
  const queue = appointments.filter(a => a.date >= new Date().toISOString().split('T')[0]);
  const badge = document.getElementById('queueCount');
  if (badge) badge.textContent = queue.length;
};

// Wire invoice search when navigating to invoice page
const _origGo = go;
window.go = function(pageId, navEl) {
  _origGo(pageId, navEl);
  if (pageId === 'invoice') {
    setTimeout(() => setupInvPatientSearch(), 100);
  }
};