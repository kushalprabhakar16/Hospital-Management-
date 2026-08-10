/* ============================================================
   data.js — Data layer: LocalStorage (Demo) + REST API
   Seeds demo data on first run. All CRUD goes through here.
   ============================================================ */

const DB = (() => {
  const KEY = 'kmsh_db_v1';
  const SEED_KEY = 'kmsh_seeded_v1';

  const DEPARTMENTS = [
    'Cardiology','Neurology','Neurosurgery','Orthopaedics','General Medicine','General Surgery',
    'Pediatrics','Neonatology','Obstetrics & Gynecology','ENT','Ophthalmology','Dermatology',
    'Oncology','Urology','Nephrology','Gastroenterology','Pulmonology','Endocrinology',
    'Psychiatry','Dental','Physiotherapy','Radiology','Emergency','ICU','NICU','Laboratory','Pharmacy'
  ];

  const ROLES = ['Admin','Doctor','Receptionist','Nurse','Lab Technician','Pharmacist','Patient'];

  function load() {
    const raw = localStorage.getItem(KEY);
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return null;
  }
  function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }

  function uid(prefix, n) {
    const s = String(n).padStart(6, '0');
    return `KMSH-${prefix}-${s}`;
  }

  function ageFromDOB(dob) {
    if (!dob) return 0;
    const d = new Date(dob); const diff = Date.now() - d.getTime();
    return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
  }

  function seed() {
    if (localStorage.getItem(SEED_KEY)) return;
    const db = {
      users: [
        { id: 1, name: 'System Administrator', email: 'admin@kmsh.in', password: 'admin123', role: 'Admin', phone: '9000000001', status: 'Active', created_at: new Date().toISOString() },
        { id: 2, name: 'Dr. Anita Rao', email: 'doctor@kmsh.in', password: 'doctor123', role: 'Doctor', phone: '9000000002', status: 'Active', created_at: new Date().toISOString() },
        { id: 3, name: 'Reception Desk', email: 'reception@kmsh.in', password: 'reception123', role: 'Receptionist', phone: '9000000003', status: 'Active', created_at: new Date().toISOString() },
        { id: 4, name: 'Nurse Priya', email: 'nurse@kmsh.in', password: 'nurse123', role: 'Nurse', phone: '9000000004', status: 'Active', created_at: new Date().toISOString() },
        { id: 5, name: 'Lab Tech Ravi', email: 'lab@kmsh.in', password: 'lab123', role: 'Lab Technician', phone: '9000000005', status: 'Active', created_at: new Date().toISOString() },
        { id: 6, name: 'Pharma Sales', email: 'pharma@kmsh.in', password: 'pharma123', role: 'Pharmacist', phone: '9000000006', status: 'Active', created_at: new Date().toISOString() },
        { id: 7, name: 'Rahul Patient', email: 'patient@kmsh.in', password: 'patient123', role: 'Patient', phone: '9000000007', status: 'Active', created_at: new Date().toISOString() },
      ],
      departments: DEPARTMENTS.map((d, i) => ({ id: i + 1, name: d, head: '', status: 'Active', created_at: new Date().toISOString() })),
      patients: [],
      doctors: [],
      appointments: [],
      operations: [],
      labTests: [],
      medicines: [],
      billing: [],
      staff: [],
      notifications: [],
      auditLogs: [],
      counters: { patients: 0, doctors: 0, appointments: 0, operations: 0, lab: 0, billing: 0, staff: 0 },
    };

    // Seed doctors
    const docSeed = [
      ['Dr. Anita Rao','MD DM','Cardiology','Cardiology','12','9001110001','anita@kmsh.in'],
      ['Dr. Vikram Singh','MS MCh','Neurosurgery','Neurosurgery','18','9001110002','vikram@kmsh.in'],
      ['Dr. Meera Nair','MD','Pediatrics','Pediatrics','9','9001110003','meera@kmsh.in'],
      ['Dr. Sanjay Gupta','MS Ortho','Orthopaedics','Orthopaedics','15','9001110004','sanjay@kmsh.in'],
      ['Dr. Kavya Reddy','MD','General Medicine','General Medicine','7','9001110005','kavya@kmsh.in'],
      ['Dr. Imran Khan','MS MCh','Oncology','Oncology','14','9001110006','imran@kmsh.in'],
    ];
    docSeed.forEach((d, i) => {
      db.counters.doctors++;
      db.doctors.push({
        id: i + 1, doctorId: uid('D', i + 1), name: d[0], gender: i % 2 ? 'Female' : 'Male',
        dob: '1980-01-15', qualification: d[1], specialization: d[2], department: d[3], experience: d[4],
        license: `MED-${1000 + i}`, phone: d[5], email: d[6], address: 'Kushal Hospital Road', room: `OPD-${101 + i}`,
        fee: 500 + i * 100, days: 'Mon-Sat', time: '09:00-17:00', languages: 'English, Hindi',
        bio: 'Experienced consultant dedicated to patient care.', certifications: 'MBBS, MD', awards: 'Best Doctor 2023',
        status: 'Active', photo: '', documents: [], stats: { patients: 120 + i * 30, appointments: 200 + i * 40, surgeries: 10 + i * 5, consultations: 300 + i * 50 },
        created_at: new Date().toISOString(),
      });
    });

    // Seed patients
    const patSeed = [
      ['Rahul Sharma','Male','1990-05-12','B+','Hypertension','Dr. Kavya Reddy','General Medicine','General Ward','B-12','Admitted'],
      ['Sneha Patil','Female','1985-09-23','O+','Diabetes','Dr. Anita Rao','Cardiology','ICU','ICU-3','Critical'],
      ['Aarav Joshi','Male','2018-03-15','A+','Asthma','Dr. Meera Nair','Pediatrics','Pediatric Ward','P-7','Admitted'],
      ['Lakshmi Iyer','Female','1978-12-01','AB+','Fracture','Dr. Sanjay Gupta','Orthopaedics','Ortho Ward','O-4','Discharged'],
      ['Mohammed Ali','Male','1965-07-19','B-','Cancer','Dr. Imran Khan','Oncology','Private Room','PR-2','Admitted'],
      ['Pooja Desai','Female','1995-02-28','O-','Migraine','Dr. Kavya Reddy','General Medicine','OPD','-','Outpatient'],
    ];
    patSeed.forEach((p, i) => {
      db.counters.patients++;
      db.patients.push({
        id: i + 1, patientId: uid('P', i + 1), name: p[0], gender: p[1], dob: p[2], age: ageFromDOB(p[2]),
        blood: p[3], height: '168', weight: '70', phone: `9002${String(i).padStart(5, '0')}`, email: `patient${i + 1}@kmsh.in`,
        address: 'Patient Address, City', emergency: '9009999' + i, disease: p[4], diagnosis: p[4] + ' - under observation',
        allergies: 'None', history: 'No major history', medication: 'Prescribed medication', insurance: 'Star Health',
        doctor: p[5], department: p[6], ward: p[7], bed: p[8], admissionDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        dischargeDate: p[9] === 'Discharged' ? new Date().toISOString().slice(0, 10) : '', status: p[9],
        notes: 'Regular monitoring required.', photo: '', documents: [],
        timeline: [
          { stage: 'Registration', date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), done: true },
          { stage: 'Admission', date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), done: p[9] !== 'Outpatient' },
          { stage: 'Consultation', date: '', done: false },
          { stage: 'Laboratory', date: '', done: false },
          { stage: 'Diagnosis', date: '', done: false },
          { stage: 'Medication', date: '', done: false },
          { stage: 'Surgery', date: '', done: false },
          { stage: 'Discharge', date: '', done: p[9] === 'Discharged' },
        ],
        created_at: new Date().toISOString(),
      });
    });

    // Seed appointments
    for (let i = 0; i < 8; i++) {
      db.counters.appointments++;
      const p = db.patients[i % db.patients.length];
      const d = db.doctors[i % db.doctors.length];
      db.appointments.push({
        id: i + 1, apptId: `KMSH-A-${String(i + 1).padStart(6, '0')}`, patientId: p.patientId, patientName: p.name,
        doctorId: d.doctorId, doctorName: d.name, department: d.department, date: new Date(Date.now() + i * 43200000).toISOString().slice(0, 10),
        time: `${9 + i}:00`, type: i % 2 ? 'Follow-up' : 'New', status: i % 3 ? 'Confirmed' : 'Pending', notes: '',
        created_at: new Date().toISOString(),
      });
    }

    // Seed operations
    [
      ['CABG', 'Rahul Sharma', 'Dr. Anita Rao', 'Cardiology', 'OT-1', 'Scheduled'],
      ['Craniotomy', 'Mohammed Ali', 'Dr. Vikram Singh', 'Neurosurgery', 'OT-2', 'Completed'],
      ['Appendectomy', 'Sneha Patil', 'Dr. Sanjay Gupta', 'General Surgery', 'OT-3', 'In Progress'],
    ].forEach((o, i) => {
      db.counters.operations++;
      db.operations.push({
        id: i + 1, surgeryId: `KMSH-S-${String(i + 1).padStart(6, '0')}`, patientName: o[1], leadDoctor: o[2],
        supporting: 'Dr. Meera Nair, Dr. Kavya Reddy', theatre: o[4], department: o[3], date: new Date().toISOString().slice(0, 10),
        time: '10:00', type: o[0], status: o[5], cost: 50000 + i * 25000, notes: '', created_at: new Date().toISOString(),
      });
    });

    // Seed lab tests
    [
      ['Complete Blood Count', 'Rahul Sharma', 'Pathology', 'Completed', 350],
      ['ECG', 'Sneha Patil', 'Cardiology', 'Pending', 500],
      ['X-Ray Chest', 'Aarav Joshi', 'Radiology', 'Completed', 400],
      ['MRI Brain', 'Mohammed Ali', 'Radiology', 'In Progress', 3500],
    ].forEach((t, i) => {
      db.counters.lab++;
      db.labTests.push({
        id: i + 1, testId: `KMSH-L-${String(i + 1).padStart(6, '0')}`, test: t[0], patientName: t[1], category: t[2],
        status: t[3], price: t[4], date: new Date().toISOString().slice(0, 10), report: '', created_at: new Date().toISOString(),
      });
    });

    // Seed pharmacy
    [
      ['Paracetamol 500mg', 1200, 'Cipla', 'B100', 5, '2025-12-31'],
      ['Amoxicillin 250mg', 540, 'Sun Pharma', 'A200', 12, '2025-06-30'],
      ['Insulin Glargine', 85, 'Lupin', 'I300', 450, '2025-09-15'],
      ['Atorvastatin 10mg', 320, 'Dr. Reddy', 'AT400', 18, '2026-01-01'],
      ['Ondansetron 4mg', 60, 'Cipla', 'O500', 8, '2025-03-20'],
    ].forEach((m, i) => {
      db.medicines.push({
        id: i + 1, medId: `KMSH-M-${String(i + 1).padStart(4, '0')}`, name: m[0], stock: m[1], supplier: m[2],
        batch: m[3], price: m[4], expiry: m[5], status: m[1] < 100 ? 'Low Stock' : 'In Stock', created_at: new Date().toISOString(),
      });
    });

    // Seed billing
    db.patients.slice(0, 4).forEach((p, i) => {
      db.counters.billing++;
      const total = 5000 + i * 3000;
      const paid = i % 2 ? total : Math.floor(total / 2);
      db.billing.push({
        id: i + 1, invoiceId: `KMSH-INV-${String(i + 1).padStart(6, '0')}`, patientId: p.patientId, patientName: p.name,
        doctor: p.doctor, consultation: 500, lab: 1200, surgery: i === 2 ? 50000 : 0, pharmacy: 800, room: 2000,
        insurance: 1000, discount: 200, gst: 540, total, paid, balance: total - paid, status: paid >= total ? 'Paid' : 'Partial',
        date: new Date().toISOString().slice(0, 10), created_at: new Date().toISOString(),
      });
    });

    // Seed staff
    [
      ['Nurse Priya', 'Nurse', 'ICU', '9003000001', 'Active'],
      ['Reception Desk', 'Receptionist', 'Front Office', '9003000002', 'Active'],
      ['Lab Tech Ravi', 'Lab Technician', 'Laboratory', '9003000003', 'Active'],
      ['Pharma Sales', 'Pharmacist', 'Pharmacy', '9003000004', 'Active'],
      ['Accountant Suresh', 'Accountant', 'Finance', '9003000005', 'Active'],
      ['Ward Boy Amit', 'Support Staff', 'General Ward', '9003000006', 'Active'],
    ].forEach((s, i) => {
      db.counters.staff++;
      db.staff.push({
        id: i + 1, staffId: `KMSH-ST-${String(i + 1).padStart(4, '0')}`, name: s[0], role: s[1], department: s[2],
        phone: s[3], email: '', shift: i % 2 ? 'Night' : 'Day', salary: 15000 + i * 5000, status: s[4], created_at: new Date().toISOString(),
      });
    });

    db.notifications = [
      { id: 1, type: 'error', title: 'Emergency: Critical patient in ICU', time: '5 min ago' },
      { id: 2, type: 'warning', title: 'Low stock: Ondansetron 4mg (60 units)', time: '20 min ago' },
      { id: 3, type: 'info', title: 'New appointment booked for Dr. Anita Rao', time: '1 hour ago' },
    ];

    save(db);
    localStorage.setItem(SEED_KEY, '1');
  }

  function get() {
    let db = load();
    if (!db) { seed(); db = load(); }
    return db;
  }

  function update(mutator) {
    const db = get();
    mutator(db);
    save(db);
    return db;
  }

  // Generic collection helpers (Demo mode)
  function all(coll) { return get()[coll] || []; }
  function find(coll, id) { return all(coll).find(x => x.id === id); }
  function add(coll, item) {
    return update(db => { db[coll].push(item); })[coll];
  }
  function put(coll, id, patch) {
    return update(db => {
      const i = db[coll].findIndex(x => x.id === id);
      if (i >= 0) Object.assign(db[coll][i], patch);
    });
  }
  function remove(coll, id) {
    update(db => { db[coll] = db[coll].filter(x => x.id !== id); });
  }
  function nextCounter(name) {
    const db = get();
    db.counters[name] = (db.counters[name] || 0) + 1;
    save(db);
    return db.counters[name];
  }

  function resetDemo() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SEED_KEY);
    seed();
  }

  return {
    seed, get, all, find, add, put, remove, nextCounter, uid, ageFromDOB, resetDemo,
    DEPARTMENTS, ROLES,
  };
})();
