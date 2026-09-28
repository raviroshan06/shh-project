/**
 * MAHASETU end-to-end smoke test
 * Mirrors every call the React client makes, so the UI flow can be validated headlessly.
 * Usage: node e2e-test.js
 */
const BASE = 'http://localhost:5001/api';

let passed = 0;
let failed = 0;

function check(label, condition, extra) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${extra ? ` -> ${JSON.stringify(extra)}` : ''}`);
  }
}

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  return { status: res.status, data };
}

(async () => {
  console.log('\n=== MAHASETU E2E SMOKE TEST ===\n');

  // 1. Citizen login (LoginPage)
  console.log('[1] Citizen OTP login');
  const login = await call('POST', '/auth/verify-otp', { body: { identifier: '9876543210', otp: '123456' } });
  check('verify-otp returns success', login.data?.success === true, login.data);
  const citizenToken = login.data?.token;
  check('JWT issued for MH-CIT-1001', login.data?.user?.id === 'MH-CIT-1001', login.data?.user);

  const personas = await call('GET', '/citizen/personas');
  check('demo persona endpoint returns 5 citizens',
    personas.data?.success === true && personas.data.personas.length === 5,
    { status: personas.status, data: personas.data });

  const otpRequest = await call('POST', '/auth/login', { body: { identifier: '9999999999' } });
  check('unknown identifier falls back to demo persona without server error',
    otpRequest.data?.success === true && otpRequest.data.sessionHint === 'MH-CIT-1001',
    { status: otpRequest.status, data: otpRequest.data });

  // 2. Unified profile (CitizenDashboard / UnifiedProfilePage)
  console.log('\n[2] Unified profile aggregation (gateway)');
  const profile = await call('GET', '/citizen/profile', { token: citizenToken });
  check('profile aggregation succeeded', profile.data?.success === true, profile.data);
  check('all 5 department adapters responded',
    profile.data?.availableSources?.length === 5, profile.data?.availableSources);
  check('canonical name resolved', !!profile.data?.normalized?.canonicalName, profile.data?.normalized);
  check('mismatch engine produced findings', Array.isArray(profile.data?.matching?.mismatches), profile.data?.matching);
  check('native schema divergence visible (citizenName/full_name)',
    !!profile.data?.sources?.aapleSarkar?.raw?.citizenName && !!profile.data?.sources?.mahaDbt?.raw?.full_name,
    Object.keys(profile.data?.sources?.mahaDbt?.raw || {}));

  // 3. Consent lifecycle (ConsentPage)
  console.log('\n[3] Consent lifecycle');
  const consentList = await call('GET', `/consent/${login.data.user.id}`, { token: citizenToken });
  check('consent ledger loaded', consentList.data?.success === true && Array.isArray(consentList.data.consents));

  const newConsent = await call('POST', '/consent/create', {
    token: citizenToken,
    body: {
      requestingDept: 'MAITRI',
      sourceDept: 'MAHABHULEKH',
      dataScopes: ['canonical_name', 'survey_gut_number'],
      purpose: 'E2E verification of purpose-bound consent',
      expiryDays: 15
    }
  });
  check('consent granted', newConsent.data?.success === true && !!newConsent.data?.consent?.id, newConsent.data);
  const consentId = newConsent.data?.consent?.id;

  const revoked = await call('DELETE', `/consent/${consentId}`, { token: citizenToken });
  check('consent revoked', revoked.data?.success === true, revoked.data);

  // 4. Service catalogue + one-click application (ServicesPage)
  console.log('\n[4] Interoperable service application');
  const services = await call('GET', '/services');
  check('service catalogue returned 4 schemes', services.data?.services?.length === 4, services.data?.services?.length);

  const apply = await call('POST', '/services/apply', { token: citizenToken, body: { serviceId: 'SRV-DBT-01' } });
  check('application filed with verified data', apply.data?.success === true && !!apply.data?.applicationId, apply.data);
  check('evidence snapshot reused multiple sources',
    (apply.data?.reusedData?.sourceSystemsReused || []).length >= 4,
    apply.data?.reusedData?.sourceSystemsReused);

  const myApps = await call('GET', '/services/applications', { token: citizenToken });
  check('citizen sees own applications', myApps.data?.success === true && myApps.data.applications.length >= 1);

  // 5. Audit ledger (HistoryPage)
  console.log('\n[5] Audit ledger');
  const logs = await call('GET', '/audit/logs?limit=100', { token: citizenToken });
  check('citizen audit trail returned', logs.data?.success === true && logs.data.logs.length > 0, logs.data?.count);
  check('citizen trail is scoped strictly to their own records',
    logs.data.logs.every(l => l.actor_id === 'MH-CIT-1001' || String(l.details || '').includes('MH-CIT-1001')),
    logs.data.logs.filter(l => l.actor_id !== 'MH-CIT-1001' && !String(l.details || '').includes('MH-CIT-1001')).slice(0, 2));
  // SECTION_2

  // 6. Health telemetry (OfficerDashboard)
  console.log('\n[6] Platform health telemetry');
  const health = await call('GET', '/health');
  check('health endpoint operational', health.data?.status === 'OPERATIONAL', health.data?.status);
  check('5 department adapters reported', health.data?.departments?.length === 5);

  // 7. Officer workflow (OfficerDashboard)
  console.log('\n[7] Officer discrepancy adjudication');
  const officerLogin = await call('POST', '/auth/verify-otp', { body: { identifier: 'OFFICER-PUNE-01', otp: '123456' } });
  check('officer login succeeded', officerLogin.data?.user?.role === 'GOVERNMENT_OFFICER', officerLogin.data?.user);
  const officerToken = officerLogin.data?.token;

  const mismatches = await call('GET', '/identity/mismatches', { token: officerToken });
  check('officer sees mismatch queue',
    mismatches.data?.success === true && mismatches.data.mismatches.length > 0, mismatches.data?.count);
  const target = mismatches.data.mismatches[0];

  const action = await call('POST', `/identity/mismatches/${target.id}/action`, {
    token: officerToken,
    body: { action: 'VERIFY', notes: 'E2E automated adjudication check' }
  });
  check('officer action applied',
    action.data?.success === true && action.data.newStatus === 'VERIFIED_MATCH', action.data);

  const recheck = await call('GET', '/identity/mismatches', { token: officerToken });
  const updated = recheck.data.mismatches.find(m => m.id === target.id);
  check('mismatch status persisted as VERIFIED_MATCH', updated?.status === 'VERIFIED_MATCH', updated?.status);

  // Officer adjudication must survive a subsequent deterministic re-evaluation of the citizen profile
  const refreshProfile = await call('GET', '/citizen/profile', { token: citizenToken });
  const refreshedFinding = (refreshProfile.data?.matching?.mismatches || []).find(m => m.id === target.id);
  const postRecheck = await call('GET', '/identity/mismatches', { token: officerToken });
  const stillVerified = postRecheck.data.mismatches.find(m => m.id === target.id);
  check('officer adjudication is sticky across matcher re-runs',
    stillVerified?.status === 'VERIFIED_MATCH' && refreshedFinding?.officerAdjudicated === true,
    { status: stillVerified?.status, flag: refreshedFinding?.officerAdjudicated });

  const officerLogs = await call('GET', '/audit/logs', { token: officerToken });
  check('officer sees state-wide ledger',
    officerLogs.data?.success === true && officerLogs.data.logs.some(l => l.action === 'MISMATCH_VERIFY'));

  const allApps = await call('GET', '/services/applications', { token: officerToken });
  check('officer sees routed applications', allApps.data?.success === true && allApps.data.applications.length >= 1);

  // 8. Consent enforcement (must be blocked without consent)
  console.log('\n[8] Consent enforcement on department adapter');
  const blocked = await call('GET', '/departments/mahadbt/schemes?citizenId=MH-CIT-1004', { token: citizenToken });
  check('raw department endpoint blocked without consent',
    blocked.status === 403 || blocked.data?.authorized === false,
    { status: blocked.status, data: blocked.data });

  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed === 0 ? 0 : 1);
})();
