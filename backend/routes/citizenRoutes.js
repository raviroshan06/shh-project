const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const GatewayService = require('../services/gateway/gatewayService');
const { db } = require('../config/database');

// GET /api/citizen/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // If officer requested a specific citizen via ?citizenId=...
    const targetCitizenId = req.user.role === 'GOVERNMENT_OFFICER' && req.query.citizenId
      ? req.query.citizenId
      : req.user.id;

    const result = await GatewayService.getUnifiedProfile(targetCitizenId, req.user);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Unified Profile error:', err);
    return res.status(500).json({ success: false, message: 'Internal interoperability gateway error', error: err.message });
  }
});

// GET /api/citizen/personas (Helper for demo presenter to quickly inspect available scenarios)
router.get('/personas', (req, res) => {
  const citizens = db
    .prepare('SELECT id, mobile, canonical_name, district, village, role, notes FROM citizens WHERE role = ?')
    .all('CITIZEN');
  return res.json({ success: true, count: citizens.length, personas: citizens });
});

module.exports = router;
