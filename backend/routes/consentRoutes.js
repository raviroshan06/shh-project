const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const ConsentService = require('../services/consent/consentService');
const AuditService = require('../services/audit/auditService');

// POST /api/consent/create
router.post('/create', authenticateToken, (req, res) => {
  const { requestingDept, sourceDept, dataScopes, purpose, expiryDays } = req.body;
  const citizenId = req.user.role === 'CITIZEN' ? req.user.id : req.body.citizenId;

  if (!requestingDept || !dataScopes) {
    return res.status(400).json({ success: false, message: 'Missing requesting department or data scopes' });
  }

  const newConsent = ConsentService.createConsent({
    citizenId,
    requestingDept,
    sourceDept,
    dataScopes,
    purpose: purpose || 'Verification for Government Scheme Eligibility',
    expiryDays: expiryDays || 30
  });

  AuditService.log({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'CONSENT_GRANTED',
    department: requestingDept,
    dataAccessed: Array.isArray(dataScopes) ? dataScopes.join(', ') : dataScopes,
    purpose: purpose || 'Service Eligibility Scrutiny',
    consentStatus: 'GRANTED',
    details: `Citizen authorized ${requestingDept} to access scopes for 30 days.`
  });

  return res.json({
    success: true,
    message: 'Consent granted successfully.',
    consent: newConsent
  });
});

// GET /api/consent/:citizenId
router.get('/:citizenId', authenticateToken, (req, res) => {
  const citizenId = req.params.citizenId;
  const consents = ConsentService.getCitizenConsents(citizenId);
  return res.json({ success: true, consents });
});

// DELETE /api/consent/:consentId
router.delete('/:consentId', authenticateToken, (req, res) => {
  const consentId = req.params.consentId;
  const revoked = ConsentService.revokeConsent(consentId);

  if (!revoked) {
    return res.status(404).json({ success: false, message: 'Consent ID not found or already inactive' });
  }

  AuditService.log({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'CONSENT_REVOKED',
    department: 'GATEWAY',
    dataAccessed: 'Revoked Scopes',
    purpose: 'Citizen Opt-out',
    consentStatus: 'REVOKED',
    details: `Citizen revoked consent record ${consentId}`
  });

  return res.json({
    success: true,
    message: 'Consent authorization revoked with immediate effect.'
  });
});

module.exports = router;
