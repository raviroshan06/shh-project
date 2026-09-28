const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireConsent } = require('../middleware/consentMiddleware');
const {
  AapleSarkarAdapter,
  MahaDbtAdapter,
  MahaBhulekhAdapter,
  EPanchayatAdapter,
  MaitriAdapter
} = require('../services/departments/departmentAdapters');

// GET /api/departments/aaple-sarkar/profile
router.get('/aaple-sarkar/profile', authenticateToken, requireConsent('AAPLE_SARKAR', ['citizenName', 'residence']), async (req, res) => {
  const citizenId = req.query.citizenId || req.user.id;
  const result = await AapleSarkarAdapter.fetchData(citizenId);
  return res.json(result);
});

// GET /api/departments/mahadbt/schemes
router.get('/mahadbt/schemes', authenticateToken, requireConsent('MAHADBT', ['scholarship_status', 'annualIncome']), async (req, res) => {
  const citizenId = req.query.citizenId || req.user.id;
  const result = await MahaDbtAdapter.fetchData(citizenId);
  return res.json(result);
});

// GET /api/departments/mahabhulekh/records
router.get('/mahabhulekh/records', authenticateToken, requireConsent('MAHABHULEKH', ['owner_name', 'survey_gut_number']), async (req, res) => {
  const citizenId = req.query.citizenId || req.user.id;
  const result = await MahaBhulekhAdapter.fetchData(citizenId);
  return res.json(result);
});

// GET /api/departments/epanchayat/profile
router.get('/epanchayat/profile', authenticateToken, requireConsent('EPANCHAYAT', ['gram_panchayat', 'house_tax_assessment_no']), async (req, res) => {
  const citizenId = req.query.citizenId || req.user.id;
  const result = await EPanchayatAdapter.fetchData(citizenId);
  return res.json(result);
});

// GET /api/departments/maitri/services
router.get('/maitri/services', authenticateToken, requireConsent('MAITRI', ['udyam_registration', 'application_status']), async (req, res) => {
  const citizenId = req.query.citizenId || req.user.id;
  const result = await MaitriAdapter.fetchData(citizenId);
  return res.json(result);
});

module.exports = router;
