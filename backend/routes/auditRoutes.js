const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const AuditService = require('../services/audit/auditService');

// GET /api/audit/logs - Officer accesses all, Citizen accesses own
router.get('/logs', authenticateToken, (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;

  if (req.user.role === 'GOVERNMENT_OFFICER') {
    const logs = AuditService.getLogs({ limit, role: 'GOVERNMENT_OFFICER' });
    return res.json({ success: true, count: logs.length, logs });
  }

  // Citizen view: strictly filter to their own access history
  const logs = AuditService.getLogs({ limit, actorId: req.user.id, role: 'CITIZEN' });
  return res.json({ success: true, count: logs.length, logs });
});

module.exports = router;
