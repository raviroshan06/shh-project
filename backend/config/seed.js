const { db, initSchema } = require('./database');

function seedDatabase() {
  initSchema();

  // 1. Seed Departments
  const depts = [
    { code: 'AAPLE_SARKAR', name: 'Aaple Sarkar Citizen Services Registry', category: 'Citizen & Domicile', status: 'ACTIVE', latency: 124, url: '/api/departments/aaple-sarkar' },
    { code: 'MAHADBT', name: 'MahaDBT Direct Benefit Transfer & Schemes', category: 'Welfare & Scholarships', status: 'ACTIVE', latency: 183, url: '/api/departments/mahadbt' },
    { code: 'MAHABHULEKH', name: 'Mahabhulekh Land Records (7/12 & 8A)', category: 'Revenue & Land', status: 'ACTIVE', latency: 212, url: '/api/departments/mahabhulekh' },
    { code: 'EPANCHAYAT', name: 'e-Panchayat Rural Local Body Registry', category: 'Rural Development', status: 'ACTIVE', latency: 145, url: '/api/departments/epanchayat' },
    { code: 'MAITRI', name: 'MAITRI Single Window Clearance System', category: 'Industries & MSME', status: 'ACTIVE', latency: 260, url: '/api/departments/maitri' }
  ];

  const insertDept = db.prepare(`
    INSERT OR REPLACE INTO departments (code, name, category, adapter_status, latency_ms, endpoint_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const d of depts) {
    insertDept.run(d.code, d.name, d.category, d.status, d.latency, d.url);
  }

  // 2. Seed Citizens (MUST BE INSERTED BEFORE CONSENTS & APPLICATIONS FOR FOREIGN KEYS!)
  const citizens = [
    {
      id: 'MH-CIT-1001',
      mobile: '9876543210',
      canonical_name: 'Ravi Shankar Kumar',
      dob: '1995-08-15',
      gender: 'M',
      district: 'Pune',
      village: 'Baramati',
      role: 'CITIZEN',
      notes: 'Scenario 1: Name abbreviation mismatch between Aaple Sarkar and MahaDBT.'
    },
    {
      id: 'MH-CIT-1002',
      mobile: '9822012345',
      canonical_name: 'Anita Ramesh Patil',
      dob: '1992-04-12',
      gender: 'F',
      district: 'Kolhapur',
      village: 'Shirol',
      role: 'CITIZEN',
      notes: 'Scenario 2: Address mismatch between Aaple Sarkar and MahaDBT.'
    },
    {
      id: 'MH-CIT-1003',
      mobile: '9423198765',
      canonical_name: 'Suresh Bapu Jadhav',
      dob: '1984-11-20',
      gender: 'M',
      district: 'Satara',
      village: 'Karad Rural',
      role: 'CITIZEN',
      notes: 'Scenario 3: Missing department record in MahaDBT system.'
    },
    {
      id: 'MH-CIT-1004',
      mobile: '9158098765',
      canonical_name: 'Priya Nilesh Deshmukh',
      dob: '1998-06-05',
      gender: 'F',
      district: 'Nagpur',
      village: 'Hingna',
      role: 'CITIZEN',
      notes: 'Scenario 4: Perfect match across all connected government departments.'
    },
    {
      id: 'MH-CIT-1005',
      mobile: '9765432109',
      canonical_name: 'Amit Vasant Shinde',
      dob: '1990-01-10',
      gender: 'M',
      district: 'Nashik',
      village: 'Dindori',
      role: 'CITIZEN',
      notes: 'Scenario 5: Multiple severe mismatches (Name, contact digit, address divergence).'
    }
  ];

  const insertCitizen = db.prepare(`
    INSERT OR REPLACE INTO citizens (id, mobile, canonical_name, dob, gender, district, village, role, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of citizens) {
    insertCitizen.run(c.id, c.mobile, c.canonical_name, c.dob, c.gender, c.district, c.village, c.role, c.notes);
  }

  // 3. Officer Account

  // 4. Seed Services
  const services = [
    {
      id: 'SRV-DBT-01',
      dept: 'MAHADBT',
      title: 'Dr. Punjabrao Deshmukh Hostel Maintenance Allowance',
      desc: 'Annual financial allowance for children of registered small land-holders/farmers admitted to approved colleges.',
      eligibility: 'Children of certified small landholders / registered farmers in Maharashtra.',
      scopes: JSON.stringify(['canonical_name', 'dob', 'address', 'land_record_summary', 'scholarship_status'])
    },
    {
      id: 'SRV-REV-02',
      dept: 'MAHABHULEKH',
      title: 'Integrated 7/12 Land Record Domicile Summary & NOC',
      desc: 'Automated digital endorsement combining Aaple Sarkar domicile with verified 7/12 land parcel records.',
      eligibility: 'Registered land owners in Maharashtra with active local residency.',
      scopes: JSON.stringify(['canonical_name', 'district', 'village', 'survey_gut_number', 'domicileCertNo'])
    },
    {
      id: 'SRV-RUR-03',
      dept: 'EPANCHAYAT',
      title: 'Gram Panchayat Rural Artisan Welfare Certification',
      desc: 'Expedited verification for village business enterprises, local tax assessment and ration registry verification.',
      eligibility: 'Rural residents certified by Gram Panchayat tax assessment.',
      scopes: JSON.stringify(['canonical_name', 'mobile', 'village', 'house_tax_assessment_no'])
    },
    {
      id: 'SRV-IND-04',
      dept: 'MAITRI',
      title: 'MAITRI MSME Single Window Industrial Clearance',
      desc: 'Interoperable fast-track environmental, local body, and revenue clearance for manufacturing and logistics units.',
      eligibility: 'Enterprises registered with Udyam Registration in Maharashtra state districts.',
      scopes: JSON.stringify(['canonical_name', 'business_name', 'udyam_registration', 'district'])
    }
  ];

  const insertService = db.prepare(`
    INSERT OR REPLACE INTO government_services (id, department_code, title, description, eligibility, required_scopes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const s of services) {
    insertService.run(s.id, s.dept, s.title, s.desc, s.eligibility, s.scopes);
  }

  // 5. Seed Consents
  const consents = [
    {
      id: 'CS-1001-DBT',
      citizen_id: 'MH-CIT-1001',
      requesting_dept: 'MAHADBT',
      source_dept: 'MAHABHULEKH',
      scopes: JSON.stringify(['owner_name', 'survey_gut_number', 'land_record_status', 'total_area_hectares']),
      purpose: 'Verification for Farmer Child Hostel Allowance',
      status: 'GRANTED',
      expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'CS-1002-EPAN',
      citizen_id: 'MH-CIT-1002',
      requesting_dept: 'EPANCHAYAT',
      source_dept: 'AAPLE_SARKAR',
      scopes: JSON.stringify(['citizenName', 'domicileCertNo', 'residence']),
      purpose: 'Rural Local Body Residence Endorsement',
      status: 'GRANTED',
      expires_at: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const insertConsent = db.prepare(`
    INSERT OR REPLACE INTO consents (id, citizen_id, requesting_dept, source_dept, data_scopes, purpose, status, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const cs of consents) {
    insertConsent.run(cs.id, cs.citizen_id, cs.requesting_dept, cs.source_dept, cs.scopes, cs.purpose, cs.status, cs.expires_at);
  }

  // 6. Seed Initial Audit Logs
  const initialLogs = [
    {
      trace_id: 'TRC-BOOT-001',
      actor_id: 'SYSTEM_GATEWAY',
      actor_role: 'SYSTEM',
      action: 'SERVICE_INITIALIZATION',
      department: 'ALL',
      data_accessed: 'Registry Adapters Health Check',
      purpose: 'Platform Boot & Health Telemetry Check',
      consent_status: 'NOT_APPLICABLE',
      ip_address: '127.0.0.1',
      details: 'All 5 department adapters initialized successfully.'
    },
    {
      trace_id: 'TRC-AUTH-002',
      actor_id: 'MH-CIT-1001',
      actor_role: 'CITIZEN',
      action: 'CONSENT_GRANTED',
      department: 'MAHADBT',
      data_accessed: 'Mahabhulekh Land Summary',
      purpose: 'Verification for Farmer Child Hostel Allowance',
      consent_status: 'GRANTED',
      ip_address: '192.168.1.104',
      details: 'Citizen granted 30-day scope authorization CS-1001-DBT'
    }
  ];

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (trace_id, actor_id, actor_role, action, department, data_accessed, purpose, consent_status, ip_address, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of initialLogs) {
    insertAudit.run(l.trace_id, l.actor_id, l.actor_role, l.action, l.department, l.data_accessed, l.purpose, l.consent_status, l.ip_address, l.details);
  }

  console.log('✅ SQLite Database successfully initialized and seeded with 5 personas, 5 departments, 4 services, and mock telemetry.');

  insertCitizen.run(
    'OFFICER-PUNE-01',
    '9800011223',
    'Rajendra Deshmukh (Desk Officer)',
    '1980-03-25',
    'M',
    'Pune',
    'Pune Urban',
    'GOVERNMENT_OFFICER',
    'Administrative Officer, Maharashtra State Innovation Society'
  );

  console.log('Departments & Citizens successfully inserted.');
}

module.exports = { seedDatabase };
