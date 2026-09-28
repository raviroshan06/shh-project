const {
  AapleSarkarAdapter,
  MahaDbtAdapter,
  MahaBhulekhAdapter,
  EPanchayatAdapter,
  MaitriAdapter
} = require('../departments/departmentAdapters');
const IdentityMatcherService = require('../identity/identityMatcherService');
const AuditService = require('../audit/auditService');
const { db } = require('../../config/database');

class GatewayService {
  /**
   * Aggregates citizen records across multiple disconnected government systems.
   * Tolerates single-point department failures gracefully.
   */
  static async getUnifiedProfile(citizenId, actor = { id: citizenId, role: 'CITIZEN' }) {
    // 1. Fetch base canonical account from DB
    const citizenBase = db.prepare('SELECT * FROM citizens WHERE id = ?').get(citizenId);
    if (!citizenBase) {
      return { success: false, error: 'Citizen identifier not found in MahaSetu core registry' };
    }

    // 2. Query departmental adapters in parallel with isolated error boundaries
    const [aapleSarkarRes, mahaDbtRes, mahabhulekhRes, epanchayatRes, maitriRes] = await Promise.allSettled([
      AapleSarkarAdapter.fetchData(citizenId),
      MahaDbtAdapter.fetchData(citizenId),
      MahaBhulekhAdapter.fetchData(citizenId),
      EPanchayatAdapter.fetchData(citizenId),
      MaitriAdapter.fetchData(citizenId)
    ]);

    const sources = {
      aapleSarkar: aapleSarkarRes.status === 'fulfilled' ? aapleSarkarRes.value : { success: false, error: aapleSarkarRes.reason?.message },
      mahaDbt: mahaDbtRes.status === 'fulfilled' ? mahaDbtRes.value : { success: false, error: mahaDbtRes.reason?.message },
      mahabhulekh: mahabhulekhRes.status === 'fulfilled' ? mahabhulekhRes.value : { success: false, error: mahabhulekhRes.reason?.message },
      epanchayat: epanchayatRes.status === 'fulfilled' ? epanchayatRes.value : { success: false, error: epanchayatRes.reason?.message },
      maitri: maitriRes.status === 'fulfilled' ? maitriRes.value : { success: false, error: maitriRes.reason?.message }
    };

    const availableSources = Object.keys(sources).filter(k => sources[k] && sources[k].success);
    const unavailableSources = Object.keys(sources).filter(k => !sources[k] || !sources[k].success);

    // 3. Assemble Normalized Canonical Profile
    // Preference: Aaple Sarkar > MahaDBT > Base Record
    const primaryName = sources.aapleSarkar.success
      ? sources.aapleSarkar.canonical.canonical_name
      : sources.mahaDbt.success
      ? sources.mahaDbt.canonical.canonical_name
      : citizenBase.canonical_name;

    const primaryAddress = sources.aapleSarkar.success
      ? sources.aapleSarkar.canonical.address
      : sources.mahaDbt.success
      ? sources.mahaDbt.canonical.address
      : `${citizenBase.village}, ${citizenBase.district}`;

    const normalized = {
      canonicalId: citizenBase.id,
      canonicalName: primaryName,
      dateOfBirth: citizenBase.dob,
      gender: citizenBase.gender,
      mobile: citizenBase.mobile.startsWith('+91') ? citizenBase.mobile : `+91${citizenBase.mobile}`,
      address: primaryAddress,
      district: citizenBase.district,
      village: citizenBase.village,
      state: citizenBase.state,
      connectedSystemsCount: availableSources.length,
      connectedSystemsList: availableSources
    };

    // 4. Run Deterministic Identity Matching
    const adapterMap = {
      AAPLE_SARKAR: sources.aapleSarkar,
      MAHADBT: sources.mahaDbt,
      MAHABHULEKH: sources.mahabhulekh,
      EPANCHAYAT: sources.epanchayat,
      MAITRI: sources.maitri
    };
    const matching = IdentityMatcherService.evaluateCrossSystemConsistency(citizenId, adapterMap);

    // 5. Emit Audit Log
    // The aggregation state (linked registries + finding volume + officer adjudications) is part of
    // the details string, so a genuine change of state always produces a distinct audit record,
    // while simply re-loading the same unchanged profile is collapsed into the previous entry.
    const adjudicatedCount = (matching.mismatches || []).filter(m => m.officerAdjudicated).length;

    AuditService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'PROFILE_AGGREGATION',
      department: 'GATEWAY_INTEROP',
      dataAccessed: 'Unified Multi-Department Profile',
      purpose: 'Unified Citizen Profile View',
      consentStatus: 'GRANTED',
      details: `Unified profile aggregated for ${citizenId} across ${availableSources.length} departments. Discrepancies detected: ${matching.mismatchesCount}${
        adjudicatedCount > 0 ? ` (${adjudicatedCount} officer-adjudicated)` : ''
      }`,
      dedupeIdentical: true
    });

    return {
      success: true,
      status: unavailableSources.length === 0 ? 'complete' : 'partial',
      availableSources,
      unavailableSources,
      citizen: citizenBase,
      sources,
      normalized,
      matching
    };
  }
}

module.exports = GatewayService;
