const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// GET /api/health
router.get('/', (req, res) => {
  const depts = db.prepare('SELECT code, name, category, adapter_status, latency_ms FROM departments').all();

  const totalReqs = 1284;
  const successfulReqs = 1241;
  const pendingConsents = db.prepare("SELECT count(*) as c FROM consents WHERE status = 'GRANTED'").get().c;
  const totalMismatches = db.prepare('SELECT count(*) as c FROM data_mismatches').get().c;

  const departmentHealth = depts.map(d => ({
    code: d.code,
    name: d.name,
    category: d.category,
    status: d.code === 'MAITRI' ? 'WARNING' : 'OPERATIONAL',
    latencyMs: d.code === 'MAITRI' ? 780 : d.latency_ms,
    adapter: 'Mock Integration — Government Department Adapter',
    lastChecked: new Date().toISOString()
  }));

  return res.json({
    status: 'OPERATIONAL',
    version: '1.0.0-prototype',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    metrics: {
      connectedSystems: depts.length,
      totalApiRequests: totalReqs,
      successfulRequests: successfulReqs,
      failedRequests: totalReqs - successfulReqs,
      dataMismatches: totalMismatches,
      activeConsents: pendingConsents
    },
    departments: departmentHealth
  });
});

module.exports = router;
