const { db } = require('../../config/database');

class ConsentService {
  /**
   * Evaluates if requesting department has valid unexpired consent to access citizen scopes.
   */
  static verifyConsent(citizenId, requestingDept, requiredScopes = []) {
    // If request is from Citizen themselves, self-access is intrinsically authorized
    // If request is from cross-department, verify DB authorization
    const stmt = db.prepare(`
      SELECT * FROM consents
      WHERE citizen_id = ? 
        AND requesting_dept = ? 
        AND status = 'GRANTED'
        AND expires_at > datetime('now')
    `);

    const consent = stmt.get(citizenId, requestingDept);
    if (!consent) {
      return {
        authorized: false,
        reason: 'NO_ACTIVE_CONSENT',
        message: `Citizen consent is required before ${requestingDept} can access this information.`
      };
    }

    // Verify requested scopes are covered by granted scopes
    try {
      const grantedScopes = JSON.parse(consent.data_scopes);
      const missingScopes = requiredScopes.filter(s => !grantedScopes.includes(s));
      if (missingScopes.length > 0) {
        return {
          authorized: false,
          reason: 'SCOPE_EXCEEDED',
          message: `Requested data scope(s) [${missingScopes.join(', ')}] not authorized by citizen.`,
          consentId: consent.id
        };
      }
    } catch (e) {
      // JSON parse fallback
    }

    return {
      authorized: true,
      consentId: consent.id,
      expiresAt: consent.expires_at,
      purpose: consent.purpose
    };
  }

  static getCitizenConsents(citizenId) {
    const stmt = db.prepare(`
      SELECT c.*, d1.name as requesting_dept_name, d2.name as source_dept_name
      FROM consents c
      LEFT JOIN departments d1 ON c.requesting_dept = d1.code
      LEFT JOIN departments d2 ON c.source_dept = d2.code
      WHERE c.citizen_id = ?
      ORDER BY c.created_at DESC
    `);
    return stmt.all(citizenId);
  }

  static createConsent(data) {
    const id = `CS-${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date(Date.now() + (data.expiryDays || 30) * 24 * 3600 * 1000).toISOString();
    const scopesJson = typeof data.dataScopes === 'string' ? data.dataScopes : JSON.stringify(data.dataScopes || []);

    const stmt = db.prepare(`
      INSERT INTO consents (id, citizen_id, requesting_dept, source_dept, data_scopes, purpose, status, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, 'GRANTED', ?)
    `);

    stmt.run(id, data.citizenId, data.requestingDept, data.sourceDept || 'ALL', scopesJson, data.purpose, expiresAt);

    return {
      id,
      citizen_id: data.citizenId,
      requesting_dept: data.requestingDept,
      status: 'GRANTED',
      expires_at: expiresAt
    };
  }

  static revokeConsent(consentId) {
    const stmt = db.prepare(`
      UPDATE consents
      SET status = 'REVOKED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const res = stmt.run(consentId);
    return res.changes > 0;
  }
}

module.exports = ConsentService;
