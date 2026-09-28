import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle, RefreshCw, ArrowRight, FileCheck2, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ServicesPage({ setActivePage }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [svcRes, profRes] = await Promise.all([
        api.get('/services'),
        api.get('/citizen/profile')
      ]);
      if (svcRes.data.success) setServices(svcRes.data.services);
      if (profRes.data.success) setProfile(profRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyNow = async (service) => {
    setApplying(service.id);
    setReceipt(null);
    setError('');
    try {
      const res = await api.post('/services/apply', { serviceId: service.id });
      if (res.data.success) setReceipt(res.data);
      else setError(res.data.message || 'Application could not be filed');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center space-x-2 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
        <span>Fetching cross-department service catalogue...</span>
      </div>
    );
  }

  const normalized = profile?.normalized;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4">
        <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-orange-600" />
          <span>Interoperable Government Service Catalogue</span>
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
            Demo Service Workflow
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          One-click applications — MahaSetu auto-fills every verified field from your connected departmental registries.
          No document upload, no manual re-entry.
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Simulated service workflow using mock government integrations — no application is filed with a real department.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2">{error}</div>
      )}

      <div className="bg-slate-900 text-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold flex items-center space-x-1.5">
            <FileCheck2 className="w-4 h-4 text-orange-400" />
            <span>Auto-Fill Source (Live from Gateway Aggregation)</span>
          </span>
          <span className="text-[10px] bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded font-semibold">
            {profile?.availableSources?.length || 0} registries linked
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-slate-800 rounded p-2">
            <span className="text-slate-400 block text-[10px]">canonical_name</span>
            <span className="font-semibold">{normalized?.canonicalName}</span>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <span className="text-slate-400 block text-[10px]">dob</span>
            <span className="font-semibold">{normalized?.dateOfBirth}</span>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <span className="text-slate-400 block text-[10px]">mobile</span>
            <span className="font-semibold">{normalized?.mobile}</span>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <span className="text-slate-400 block text-[10px]">address / district</span>
            <span className="font-semibold truncate block">{normalized?.address}, {normalized?.district}</span>
          </div>
        </div>
      </div>

      {receipt && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-900 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Application filed successfully — {receipt.applicationId}</span>
            </span>
            <button
              onClick={() => setActivePage('applications')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center"
            >
              <span>Track Applications</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <p className="text-[11px] text-emerald-800">
            {receipt.serviceTitle} routed to <strong>{receipt.targetDepartment}</strong> with a signed evidence snapshot.
            Data reused from: {receipt.reusedData?.sourceSystemsReused?.join(', ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((s) => {
          let scopes = [];
          try { scopes = JSON.parse(s.required_scopes); } catch (e) { scopes = [s.required_scopes]; }

          return (
            <div key={s.id} className="bg-white rounded-xl border p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-sm text-slate-900 leading-snug">{s.title}</span>
                  <span className="bg-orange-50 text-orange-700 border border-orange-200 rounded px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap">
                    {s.department_code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.description}</p>
                <div className="text-[11px] text-slate-500">
                  <strong className="text-slate-600">Eligibility:</strong> {s.eligibility}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scopes.map((sc, i) => (
                    <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-mono text-[10px]">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-[10px] text-slate-400 font-mono">{s.id} • {s.department_name}</span>
                <button
                  onClick={() => applyNow(s)}
                  disabled={applying === s.id}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded text-xs font-bold flex items-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{applying === s.id ? 'Filing...' : 'Apply (Verified Data)'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
