const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mahsetu.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS citizens (
      id TEXT PRIMARY KEY,
      mobile TEXT UNIQUE NOT NULL,
      canonical_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      district TEXT NOT NULL,
      village TEXT,
      state TEXT DEFAULT 'Maharashtra',
      role TEXT DEFAULT 'CITIZEN',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      adapter_status TEXT DEFAULT 'ACTIVE',
      latency_ms INTEGER DEFAULT 120,
      endpoint_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY,
      citizen_id TEXT NOT NULL,
      requesting_dept TEXT NOT NULL,
      source_dept TEXT NOT NULL,
      data_scopes TEXT NOT NULL, -- JSON array
      purpose TEXT NOT NULL,
      status TEXT NOT NULL, -- 'GRANTED', 'REJECTED', 'EXPIRED', 'REVOKED'
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(citizen_id) REFERENCES citizens(id),
      FOREIGN KEY(requesting_dept) REFERENCES departments(code),
      FOREIGN KEY(source_dept) REFERENCES departments(code)
    );

    CREATE TABLE IF NOT EXISTS government_services (
      id TEXT PRIMARY KEY,
      department_code TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      required_scopes TEXT NOT NULL, -- JSON array
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(department_code) REFERENCES departments(code)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      citizen_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      target_department TEXT NOT NULL,
      payload_snapshot TEXT NOT NULL, -- JSON of normalized verified data
      status TEXT NOT NULL, -- 'SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(citizen_id) REFERENCES citizens(id),
      FOREIGN KEY(service_id) REFERENCES government_services(id)
    );

    CREATE TABLE IF NOT EXISTS data_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id TEXT NOT NULL,
      department_code TEXT NOT NULL,
      raw_payload TEXT NOT NULL, -- JSON string
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(citizen_id) REFERENCES citizens(id),
      FOREIGN KEY(department_code) REFERENCES departments(code)
    );

    CREATE TABLE IF NOT EXISTS data_mismatches (
      id TEXT PRIMARY KEY,
      citizen_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      dept_a_code TEXT NOT NULL,
      dept_a_value TEXT NOT NULL,
      dept_b_code TEXT NOT NULL,
      dept_b_value TEXT NOT NULL,
      confidence_score REAL NOT NULL,
      status TEXT DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'VERIFIED_MATCH', 'CORRECTION_INITIATED'
      officer_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(citizen_id) REFERENCES citizens(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trace_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      department TEXT,
      data_accessed TEXT,
      purpose TEXT,
      consent_status TEXT,
      ip_address TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_code TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      response_code INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_citizens_mobile ON citizens(mobile);
    CREATE INDEX IF NOT EXISTS idx_consents_citizen ON consents(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_mismatches_status ON data_mismatches(status);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
  `);
}

module.exports = {
  db,
  initSchema
};
