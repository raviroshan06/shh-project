const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { db } = require('../config/database');
const AuditService = require('../services/audit/auditService');

// GET /api/identity/mismatches (Officer review queue)
router.get('/mismatches', authenticateToken, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM data_mismatches ORDER BY created_at DESC';
  if (status) {
    sql = 'SELECT * FROM data_mismatches WHERE status = ? ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(status);
    return res.json({ success: true, count: rows.length, mismatches: rows });
  }

  const rows = db.prepare(sql).all();
  return res.json({ success: true, count: rows.length, mismatches: rows });
});

// POST /api/identity/mismatches/:id/action (Review, Verify, or Initiate Correction)
router.post('/mismatches/:id/action', authenticateToken, requireRole('GOVERNMENT_OFFICER'), (req, res) => {
  const mismatchId = req.params.id;
  const { action, notes } = req.body;

  let newStatus = 'REVIEWED';
  if (action === 'VERIFY') newStatus = 'VERIFIED_MATCH';
  if (action === 'INITIATE_CORRECTION') newStatus = 'CORRECTION_INITIATED';

  const stmt = db.prepare(`
    UPDATE data_mismatches
    SET status = ?, officer_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const info = stmt.run(newStatus, notes || `Officer action: ${action}`, mismatchId);

  AuditService.log({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: `MISMATCH_${action}`,
    department: 'OFFICER_DESK',
    dataAccessed: 'Identity Discrepancy Record',
    purpose: 'Administrative Verification',
    consentStatus: 'NOT_APPLICABLE',
    details: `Officer took action ${action} on mismatch ${mismatchId}. Notes: ${notes}`
  });

  return res.json({
    success: true,
    message: `Mismatch status successfully updated to [${newStatus}]`,
    mismatchId,
    newStatus
  });
});

module.exports = router;
