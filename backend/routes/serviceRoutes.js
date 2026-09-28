const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { db } = require('../config/database');
const GatewayService = require('../services/gateway/gatewayService');
const AuditService = require('../services/audit/auditService');

// GET /api/services - List all cross-department schemes
router.get('/', (req, res) => {
  const services = db.prepare(`
    SELECT s.*, d.name as department_name
    FROM government_services s
    JOIN departments d ON s.department_code = d.code
  `).all();

  return res.json({ success: true, services });
});

// POST /api/services/apply - Instant one-click application filing using interoperable verified data
router.post('/apply', authenticateToken, async (req, res) => {
  const { serviceId } = req.body;
  const citizenId = req.user.id;

  const service = db.prepare('SELECT * FROM government_services WHERE id = ?').get(serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Government service not found' });
  }

  // Retrieve unified verified profile from gateway (No manual re-entry!)
  const unifiedProfile = await GatewayService.getUnifiedProfile(citizenId, req.user);
  if (!unifiedProfile.success) {
    return res.status(400).json({ success: false, message: 'Could not assemble citizen profile for application' });
  }

  const applicationId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const snapshot = {
    canonicalName: unifiedProfile.normalized.canonicalName,
    mobile: unifiedProfile.normalized.mobile,
    dateOfBirth: unifiedProfile.normalized.dateOfBirth,
    address: unifiedProfile.normalized.address,
    district: unifiedProfile.normalized.district,
    sourceSystemsReused: unifiedProfile.availableSources,
    verifiedAt: new Date().toISOString()
  };

  const insertApp = db.prepare(`
    INSERT INTO applications (id, citizen_id, service_id, target_department, payload_snapshot, status)
    VALUES (?, ?, ?, ?, ?, 'SUBMITTED')
  `);

  insertApp.run(applicationId, citizenId, serviceId, service.department_code, JSON.stringify(snapshot));

  AuditService.log({
    actorId: citizenId,
    actorRole: 'CITIZEN',
    action: 'SERVICE_APPLICATION_FILED',
    department: service.department_code,
    dataAccessed: 'Reused Normalized Profile',
    purpose: `Filing for ${service.title}`,
    consentStatus: 'GRANTED',
    details: `Application ${applicationId} submitted with zero manual re-entry. Verified data pulled from ${unifiedProfile.availableSources.join(', ')}.`
  });

  return res.json({
    success: true,
    message: 'Application submitted successfully using verified interoperable records.',
    applicationId,
    serviceTitle: service.title,
    targetDepartment: service.department_code,
    reusedData: snapshot
  });
});

// GET /api/services/applications - Citizen gets own, Officer gets all
router.get('/applications', authenticateToken, (req, res) => {
  if (req.user.role === 'GOVERNMENT_OFFICER') {
    const apps = db.prepare(`
      SELECT a.*, s.title as service_title, c.canonical_name as citizen_name
      FROM applications a
      JOIN government_services s ON a.service_id = s.id
      JOIN citizens c ON a.citizen_id = c.id
      ORDER BY a.created_at DESC
    `).all();
    return res.json({ success: true, count: apps.length, applications: apps });
  }

  const apps = db.prepare(`
    SELECT a.*, s.title as service_title
    FROM applications a
    JOIN government_services s ON a.service_id = s.id
    WHERE a.citizen_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user.id);

  return res.json({ success: true, count: apps.length, applications: apps });
});

module.exports = router;
