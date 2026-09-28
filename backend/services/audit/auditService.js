const { db } = require('../../config/database');

class AuditService {
  /**
   * Records an immutable audit log entry into SQLite.
   *
   * `dedupeIdentical` (opt-in) collapses *automatic* repeats of the exact same event by the same
   * actor — e.g. refreshing the Unified Profile page re-runs the gateway aggregation and would
   * otherwise append an identical PROFILE AGGREGATION row on every page load. The entry is only
   * suppressed when the previous event for that actor + action carries byte-identical details
   * (same registries linked, same findings, same adjudication state). Any real change of state
   * produces different details and is therefore always recorded with its own trace ID.
   */
  static log({
    traceId = `TRC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId = 'ANONYMOUS',
    actorRole = 'SYSTEM',
    action = 'DATA_ACCESS',
    department = 'GATEWAY',
    dataAccessed = 'General',
    purpose = 'Inspection',
    consentStatus = 'GRANTED',
    ipAddress = '127.0.0.1',
    details = '',
    dedupeIdentical = false
  }) {
    try {
      if (dedupeIdentical) {
        const previous = db.prepare(`
          SELECT details FROM audit_logs
          WHERE actor_id = ? AND action = ?
          ORDER BY id DESC
          LIMIT 1
        `).get(actorId, action);

        if (previous && previous.details === details) {
          return { logged: false, deduplicated: true };
        }
      }

      const stmt = db.prepare(`
        INSERT INTO audit_logs (trace_id, actor_id, actor_role, action, department, data_accessed, purpose, consent_status, ip_address, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(traceId, actorId, actorRole, action, department, dataAccessed, purpose, consentStatus, ipAddress, details);
      return { logged: true, id: info.lastInsertRowid };
    } catch (err) {
      console.error('Audit log failed:', err.message);
      return { logged: false, error: err.message };
    }
  }

  static getLogs({ limit = 50, actorId = null, role = null }) {
    if (role === 'CITIZEN' && actorId) {
      const stmt = db.prepare(`
        SELECT * FROM audit_logs
        WHERE actor_id = ? OR details LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(actorId, `%${actorId}%`, limit);
    }

    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
}

module.exports = AuditService;
