const express = require('express');
const cors = require('cors');
const path = require('path');
const { seedDatabase } = require('./config/seed');

// Initialize database & tables
seedDatabase();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/consent', require('./routes/consentRoutes'));
app.use('/api/identity', require('./routes/identityRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'MAHASETU',
    subtitle: 'Unified Government Digital Services & Interoperability Platform',
    problemStatement: 'SIH 2026 Problem Statement ID: 26129',
    organization: 'Government of Maharashtra',
    status: 'ACTIVE',
    notice: 'DEMO PROTOTYPE — FICTIONAL CITIZEN DATA — MOCK GOVERNMENT INTEGRATIONS'
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal interoperability platform error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  MAHASETU Interoperability Platform Backend`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  SIH 2026 Demo Prototype — Fictional Demo Data`);
  console.log(`====================================================`);

  // Simulated nightly identity reconciliation sweep.
  // Aggregates every persona through the gateway so the officer discrepancy queue,
  // the audit ledger and the demo telemetry are populated the moment the platform boots.
  (async () => {
    try {
      const GatewayService = require('./services/gateway/gatewayService');
      const { db } = require('./config/database');
      const personas = db.prepare('SELECT id FROM citizens WHERE role = ?').all('CITIZEN');

      let flagged = 0;
      for (const persona of personas) {
        const result = await GatewayService.getUnifiedProfile(persona.id, {
          id: 'SYSTEM_GATEWAY',
          role: 'SYSTEM'
        });
        if (result.success) flagged += result.matching?.mismatchesCount || 0;
      }

      const queued = db.prepare('SELECT count(*) AS c FROM data_mismatches').get().c;
      console.log(`  Reconciliation sweep: ${personas.length} personas aggregated, ${flagged} discrepancies detected.`);
      console.log(`  Officer discrepancy queue primed with ${queued} record(s).`);
      console.log(`====================================================`);
    } catch (err) {
      console.error('Reconciliation sweep failed:', err.message);
    }
  })();
});
