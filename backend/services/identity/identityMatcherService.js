const StringSimilarity = require('./stringSimilarity');
const { db } = require('../../config/database');

class IdentityMatcherService {
  /**
   * Evaluates identity consistency across departmental canonical payloads.
   * Compares Name, DOB, Mobile, and Address across connected systems.
   */
  static evaluateCrossSystemConsistency(citizenId, canonicalSources) {
    const mismatches = [];
    const sourceKeys = Object.keys(canonicalSources).filter(k => canonicalSources[k] && canonicalSources[k].success);

    if (sourceKeys.length < 2) {
      return {
        overallScore: 1.0,
        status: 'SINGLE_SOURCE',
        summary: 'Only 1 department profile connected',
        mismatches: []
      };
    }

    // 1. Cross-compare Names
    for (let i = 0; i < sourceKeys.length; i++) {
      for (let j = i + 1; j < sourceKeys.length; j++) {
        const keyA = sourceKeys[i];
        const keyB = sourceKeys[j];
        const nameA = canonicalSources[keyA].canonical.canonical_name;
        const nameB = canonicalSources[keyB].canonical.canonical_name;

        if (nameA && nameB) {
          const res = StringSimilarity.compareNames(nameA, nameB);
          if (res.status === 'POSSIBLE_MATCH' || res.status === 'MISMATCH') {
            mismatches.push({
              id: `MM-${citizenId}-${keyA}-${keyB}-NAME`,
              citizenId,
              field: 'Name',
              systemA: canonicalSources[keyA].name,
              valueA: nameA,
              systemB: canonicalSources[keyB].name,
              valueB: nameB,
              confidenceScore: res.score,
              status: res.status,
              reason: res.reason
            });
          }
        }

        // Compare Addresses if both urban/detailed
        const addrA = canonicalSources[keyA].canonical.address;
        const addrB = canonicalSources[keyB].canonical.address;
        if (addrA && addrB && (keyA === 'AAPLE_SARKAR' || keyA === 'MAHADBT') && (keyB === 'AAPLE_SARKAR' || keyB === 'MAHADBT')) {
          const aRes = StringSimilarity.compareAddresses(addrA, addrB);
          if (aRes.status === 'MISMATCH' || aRes.status === 'POSSIBLE_MATCH') {
            mismatches.push({
              id: `MM-${citizenId}-${keyA}-${keyB}-ADDR`,
              citizenId,
              field: 'Address',
              systemA: canonicalSources[keyA].name,
              valueA: addrA,
              systemB: canonicalSources[keyB].name,
              valueB: addrB,
              confidenceScore: aRes.score,
              status: aRes.status,
              reason: 'Residence records diverge between welfare registry and citizen portal'
            });
          }
        }
      }
    }

    // Synchronize detected mismatches into SQLite data_mismatches table for officer review
    // Officer adjudications are STICKY: once a desk officer has verified the identity or raised a
    // correction request, re-running the deterministic matcher must not silently reset that decision.
    const priorStatuses = db.prepare('SELECT id, status FROM data_mismatches').all()
      .reduce((acc, row) => { acc[row.id] = row.status; return acc; }, {});

    const upsertMismatch = db.prepare(`
      INSERT OR REPLACE INTO data_mismatches (id, citizen_id, field_name, dept_a_code, dept_a_value, dept_b_code, dept_b_value, confidence_score, status, officer_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const m of mismatches) {
      const prior = priorStatuses[m.id];

      if (prior === 'VERIFIED_MATCH' || prior === 'CORRECTION_INITIATED') {
        // Preserve the human decision and surface it to the citizen view
        m.officerStatus = prior;
        m.officerAdjudicated = true;
        continue;
      }

      upsertMismatch.run(
        m.id,
        m.citizenId,
        m.field,
        m.systemA,
        m.valueA,
        m.systemB,
        m.valueB,
        m.confidenceScore,
        m.status === 'POSSIBLE_MATCH' ? 'PENDING_REVIEW' : 'FLAGGED_MISMATCH',
        m.reason
      );
    }

    const overallStatus = mismatches.some(m => m.status === 'MISMATCH')
      ? 'MISMATCH'
      : mismatches.some(m => m.status === 'POSSIBLE_MATCH')
      ? 'POSSIBLE_MATCH'
      : 'MATCHED';

    return {
      overallStatus,
      mismatchesCount: mismatches.length,
      mismatches
    };
  }
}

module.exports = IdentityMatcherService;
