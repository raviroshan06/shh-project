const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const AuditService = require('../services/audit/auditService');

// Demo helper: any unrecognised identifier falls back to the primary demo persona so that
// judges can always get into the prototype without hunting for a valid mobile number.
const DEMO_FALLBACK_CITIZEN_ID = 'MH-CIT-1001';
const findCitizenByDemoIdentifier = (identifier) => {
  const exact = db.prepare('SELECT * FROM citizens WHERE mobile = ? OR id = ?').get(identifier, identifier);
  if (exact) return exact;
  return db.prepare('SELECT * FROM citizens WHERE id = ?').get(DEMO_FALLBACK_CITIZEN_ID);
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { identifier, role } = req.body;

  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Please provide mobile number or officer ID' });
  }

  const user = findCitizenByDemoIdentifier(identifier);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered citizen or officer found' });
  }

  return res.json({
    success: true,
    message: `Demo OTP sent successfully to registered mobile number ending with **${user.mobile.slice(-4)}`,
    demoOtp: '123456',
    sessionHint: user.id
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { identifier, otp } = req.body;

  if (otp !== '123456') {
    return res.status(400).json({ success: false, message: 'Invalid OTP entered. Please enter demo OTP: 123456' });
  }

  const user = findCitizenByDemoIdentifier(identifier);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered citizen or officer found' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.canonical_name,
      role: user.role,
      mobile: user.mobile
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  AuditService.log({
    actorId: user.id,
    actorRole: user.role,
    action: 'USER_LOGIN',
    department: 'AUTH_SERVICE',
    dataAccessed: 'Authentication Token',
    purpose: 'Session Generation',
    consentStatus: 'GRANTED',
    details: `User ${user.canonical_name} logged in with demo credentials.`
  });

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      name: user.canonical_name,
      role: user.role,
      mobile: user.mobile,
      district: user.district,
      village: user.village
    }
  });
});

module.exports = router;
