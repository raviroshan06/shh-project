import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import api from '../services/api';

const SOURCE_META = [
  { key: 'aapleSarkar', label: 'Aaple Sarkar', category: 'Citizen & Domicile', nativeNameKey: 'citizenName', nativeAddrKey: 'residence', nativeDobKey: 'birthDate' },
  { key: 'mahaDbt', label: 'MahaDBT', category: 'Welfare & Scholarships', nativeNameKey: 'full_name', nativeAddrKey: 'address_line', nativeDobKey: 'dob' },
  { key: 'mahabhulekh', label: 'Mahabhulekh', category: 'Revenue & Land (7/12)', nativeNameKey: 'owner_name', nativeAddrKey: 'village', nativeDobKey: null },
  { key: 'epanchayat', label: 'e-Panchayat', category: 'Rural Development', nativeNameKey: 'name', nativeAddrKey: 'village', nativeDobKey: null },
  { key: 'maitri', label: 'MAITRI', category: 'Industries & MSME', nativeNameKey: 'applicant_name', nativeAddrKey: 'district', nativeDobKey: null }
];

export default function UnifiedProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/citizen/profile');
      if (res.data.success) setProfile(res.data);
      else setError(res.data.error || 'Gateway could not assemble profile');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center space-x-2 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
        <span>Aggregating cross-department records through MahaSetu gateway...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 text-center text-sm text-red-700 bg-red-50 border border-red-200 m-4 rounded">
        {error}
      </div>
    );
  }

  const normalized = profile?.normalized;
  const sources = profile?.sources || {};
  const mismatches = profile?.matching?.mismatches || [];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Unified Citizen Profile &amp; Registry Provenance</h1>
          <p className="text-xs text-slate-500">
            Side-by-side view of how divergent departmental schemas are normalized by MahaSetu adapters
          </p>
        </div>
        <button
          onClick={fetchProfile}
          className="text-xs font-semibold text-slate-600 hover:text-orange-600 flex items-center space-x-1 border rounded px-2 py-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-run Matching</span>
        </button>
      </div>

      {mismatches.length > 0 ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Deterministic Matching Engine flagged {mismatches.length} inconsistency record(s)</span>
          </div>
          {mismatches.map((m, idx) => (
            <div key={idx} className="bg-white/80 border border-amber-200 rounded p-2 text-[11px] text-amber-900 flex flex-wrap justify-between gap-2">
              <span>
                <strong>{m.field} divergence</strong> — {m.systemA}: "{m.valueA}" <span className="text-slate-400">vs</span> {m.systemB}: "{m.valueB}"
              </span>
              <span className="font-mono bg-amber-200 px-1.5 rounded font-bold">
                {Math.round((m.confidenceScore || 0) * 100)}% similarity • {String(m.status).replace('_', ' ')}
              </span>
              {m.officerAdjudicated && (
                <span className="font-mono bg-emerald-200 text-emerald-900 px-1.5 rounded font-bold">
                  Officer: {String(m.officerStatus).replace(/_/g, ' ')}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-900 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>All connected departmental records are fully consistent. No manual intervention required.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Canonical Unified Attributes (Normalized Target Model)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-400 text-[10px] block">Canonical Name</span>
            <span className="font-bold text-slate-800">{normalized?.canonicalName}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-400 text-[10px] block">Date of Birth</span>
            <span className="font-bold text-slate-800">{normalized?.dateOfBirth}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-400 text-[10px] block">Verified Mobile</span>
            <span className="font-bold text-slate-800">{normalized?.mobile}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-400 text-[10px] block">District / State</span>
            <span className="font-bold text-slate-800">{normalized?.district}, {normalized?.state}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100 col-span-2">
            <span className="text-slate-400 text-[10px] block">Resolved Address</span>
            <span className="font-bold text-slate-800">{normalized?.address}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-400 text-[10px] block">Gateway Status</span>
            <span className="font-bold text-slate-800 uppercase">{profile?.status}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-400 text-[10px] block">Systems Aggregated</span>
            <span className="font-bold text-slate-800">{profile?.availableSources?.length} of 5</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center text-xs">
          <span className="font-bold flex items-center">
            <Database className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
            Registry Provenance — Disparate Native Schema vs Canonical Model
          </span>
          <span className="text-[10px] text-slate-400">Zero manual re-upload</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-2.5">Department System</th>
                <th className="p-2.5">Native Keys</th>
                <th className="p-2.5">Native Values</th>
                <th className="p-2.5">Canonical Mapping</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {SOURCE_META.map((meta) => {
                const src = sources[meta.key];
                const ok = src && src.success;
                const raw = ok ? src.raw : null;
                const canonicalName = ok ? src.canonical.canonical_name : null;
                const differs = ok && meta.key !== 'aapleSarkar' && sources.aapleSarkar?.success
                  && canonicalName && canonicalName !== sources.aapleSarkar.canonical.canonical_name;

                return (
                  <tr key={meta.key} className={ok ? '' : 'bg-slate-50/60'}>
                    <td className="p-2.5">
                      <span className="font-bold text-slate-900 block">{meta.label}</span>
                      <span className="text-[10px] text-slate-500">{meta.category}</span>
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-500 leading-relaxed">
                      <div>{meta.nativeNameKey}</div>
                      <div>{meta.nativeAddrKey}</div>
                      {meta.nativeDobKey && <div>{meta.nativeDobKey}</div>}
                    </td>
                    <td className="p-2.5 text-[11px] leading-relaxed">
                      {ok ? (
                        <>
                          <div className="font-semibold">{raw?.[meta.nativeNameKey] || '—'}</div>
                          <div className="text-slate-500">{raw?.[meta.nativeAddrKey] || '—'}</div>
                          {meta.nativeDobKey && <div className="text-slate-500">{raw?.[meta.nativeDobKey] || '—'}</div>}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">{src?.error || 'No record in this registry'}</span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-600">
                      {ok ? (
                        <>
                          <div>canonical_name ← {canonicalName}</div>
                          <div>address ← {src.canonical.address || '—'}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td className="p-2.5">
                      {!ok ? (
                        <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          NOT LINKED
                        </span>
                      ) : differs ? (
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          NORMALIZED • DIVERGENT
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          NORMALIZED • MATCHED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
