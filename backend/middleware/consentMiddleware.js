const ConsentService = require('../services/consent/consentService');
const AuditService = require('../services/audit/auditService');

/**
 * Middleware that strictly verifies if cross-department access has an unexpired GRANTED consent.
 */
function requireConsent(requestingDeptParam, requiredScopes = []) {
  return (req, res, next) => {
    const citizenId = req.query.citizenId || req.body.citizenId || (req.user && req.user.id);
    const requestingDept = req.headers['x-requesting-department'] || requestingDeptParam || 'UNKNOWN_DEPT';

    // If caller is the citizen accessing their own records, allow directly
    if (req.user && req.user.role === 'CITIZEN' && req.user.id === citizenId) {
      return next();
    }

    // Cross-department check
    const check = ConsentService.verifyConsent(citizenId, requestingDept, requiredScopes);
    if (!check.authorized) {
      // Record blocked attempt in Audit Log
      AuditService.log({
        actorId: req.user ? req.user.id : 'GATEWAY_CALLER',
        actorRole: req.user ? req.user.role : 'ANONYMOUS',
        action: 'ACCESS_BLOCKED_NO_CONSENT',
        department: requestingDept,
        dataAccessed: requiredScopes.join(', ') || 'Department Data',
        purpose: 'Cross-System Access Attempt',
        consentStatus: 'BLOCKED',
        details: check.message
      });

      return res.status(403).json({
        success: false,
        consentRequired: true,
        reason: check.reason,
        message: 'Citizen consent is required before accessing this information.',
        details: check.message
      });
    }

    req.consent = check;
    next();
  };
}

module.exports = {
  requireConsent
};
