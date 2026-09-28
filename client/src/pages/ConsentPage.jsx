import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldOff, RefreshCw, PlusCircle, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  { code: 'AAPLE_SARKAR', name: 'Aaple Sarkar Citizen Services Registry' },
  { code: 'MAHADBT', name: 'MahaDBT Direct Benefit Transfer & Schemes' },
  { code: 'MAHABHULEKH', name: 'Mahabhulekh Land Records (7/12 & 8A)' },
  { code: 'EPANCHAYAT', name: 'e-Panchayat Rural Local Body Registry' },
  { code: 'MAITRI', name: 'MAITRI Single Window Clearance System' }
];

const SCOPE_OPTIONS = [
  { key: 'canonical_name', label: 'Canonical Name' },
  { key: 'mobile', label: 'Mobile Number' },
  { key: 'address', label: 'Residential Address' },
  { key: 'district', label: 'District' },
  { key: 'owner_name', label: 'Land Owner Name (7/12)' },
  { key: 'survey_gut_number', label: 'Survey / Gut Number' },
  { key: 'scholarship_status', label: 'Scholarship Status' },
  { key: 'gram_panchayat', label: 'Gram Panchayat' },
  { key: 'udyam_registration', label: 'Udyam Registration' }
];

export default function ConsentPage() {
  const { user } = useAuth();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    requestingDept: 'MAHADBT',
    sourceDept: 'MAHABHULEKH',
    purpose: 'Verification for Government Scheme Eligibility',
    expiryDays: 30,
    scopes: ['canonical_name', 'address']
  });

  useEffect(() => {
    fetchConsents();
  }, [user]);

  const fetchConsents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/consent/${user.id}`);
      if (res.data.success) setConsents(res.data.consents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleScope = (scope) => {
    setForm((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope]
    }));
  };

  const grantConsent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/consent/create', {
        requestingDept: form.requestingDept,
        sourceDept: form.sourceDept,
        dataScopes: form.scopes,
        purpose: form.purpose,
        expiryDays: Number(form.expiryDays)
      });
      if (res.data.success) {
        setToast(`Consent granted to ${form.requestingDept}`);
        setShowForm(false);
        fetchConsents();
      }
    } catch (err) {
      setToast(err.response?.data?.message || 'Consent creation failed');
    }
  };

  const revokeConsent = async (id) => {
    setBusyId(id);
    try {
      const res = await api.delete(`/consent/${id}`);
      if (res.data.success) {
        setToast('Consent revoked — department access terminated immediately');
        fetchConsents();
      }
    } catch (err) {
      setToast(err.response?.data?.message || 'Revoke failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center space-x-2 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
        <span>Loading consent ledger from gateway...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span>Consent &amp; Data Sharing Manager</span>
          </h1>
          <p className="text-xs text-slate-500">
            Consent-based, purpose-bound data access. You control which department reads which field.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold flex items-center space-x-1"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{showForm ? 'Close Form' : 'Grant New Consent'}</span>
        </button>
      </div>

      {toast && (
        <div className="bg-slate-900 text-white text-xs rounded p-2 flex justify-between items-center">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-slate-400 hover:text-white">dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={grantConsent} className="bg-white rounded-xl border p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">New Consent Authorization</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Requesting Department</label>
              <select
                value={form.requestingDept}
                onChange={(e) => setForm({ ...form, requestingDept: e.target.value })}
                className="w-full border rounded px-2 py-1.5"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data Source Department</label>
              <select
                value={form.sourceDept}
                onChange={(e) => setForm({ ...form, sourceDept: e.target.value })}
                className="w-full border rounded px-2 py-1.5"
              >
                <option value="ALL">All Linked Registries</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Validity (days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={form.expiryDays}
                onChange={(e) => setForm({ ...form, expiryDays: e.target.value })}
                className="w-full border rounded px-2 py-1.5"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Declared Purpose (Purpose-Bound Consent)</label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="w-full border rounded px-2 py-1.5"
              required
            />
          </div>

          <div className="text-xs">
            <span className="block font-bold text-slate-700 mb-1.5">Authorized Data Scopes</span>
            <div className="flex flex-wrap gap-2">
              {SCOPE_OPTIONS.map((s) => {
                const active = form.scopes.includes(s.key);
                return (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => toggleScope(s.key)}
                    className={`px-2 py-1 rounded border text-[11px] font-medium ${
                      active ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {active ? '✓ ' : ''}{s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={form.scopes.length === 0}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded text-xs font-bold"
          >
            Grant Purpose-Bound Consent
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 text-white flex justify-between items-center text-xs">
          <span className="font-bold">Active Authorization Ledger</span>
          <span className="text-[10px] text-slate-400">
            {consents.filter((c) => c.status === 'GRANTED').length} granted • {consents.filter((c) => c.status !== 'GRANTED').length} inactive
          </span>
        </div>

        {consents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No consent records found for this citizen. Grant one above to enable cross-department data reuse.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {consents.map((c) => {
              let scopes = [];
              try { scopes = JSON.parse(c.data_scopes); } catch (e) { scopes = [c.data_scopes]; }
              const active = c.status === 'GRANTED';

              return (
                <div key={c.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {c.requesting_dept_name || c.requesting_dept}
                      </span>
                      <span className="text-slate-400 text-xs">reads from</span>
                      <span className="font-semibold text-xs text-slate-700">
                        {c.source_dept_name || (c.source_dept === 'ALL' ? 'All Linked Registries' : c.source_dept)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {scopes.map((s, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span><strong className="text-slate-600">Purpose:</strong> {c.purpose}</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Valid till {new Date(c.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-mono text-[10px]">ID: {c.id}</span>
                    </div>
                  </div>

                  {active ? (
                    <button
                      onClick={() => revokeConsent(c.id)}
                      disabled={busyId === c.id}
                      className="self-start lg:self-center px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      <span>{busyId === c.id ? 'Revoking...' : 'Revoke Access'}</span>
                    </button>
                  ) : (
                    <span className="self-start lg:self-center text-[11px] text-slate-400 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-slate-300" />
                      Access terminated
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
