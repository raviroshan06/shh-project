import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertTriangle, Database, Gauge, FileText } from 'lucide-react';
import api from '../services/api';

const STATUS_STYLES = {
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  FLAGGED_MISMATCH: 'bg-rose-100 text-rose-700',
  VERIFIED_MATCH: 'bg-emerald-100 text-emerald-800',
  CORRECTION_INITIATED: 'bg-blue-100 text-blue-800',
  REVIEWED: 'bg-slate-200 text-slate-700'
};

export default function OfficerDashboard() {
  const [health, setHealth] = useState(null);
  const [mismatches, setMismatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [healthRes, mmRes, appRes] = await Promise.all([
        api.get('/health'),
        api.get('/identity/mismatches'),
        api.get('/services/applications')
      ]);
      if (healthRes.data) setHealth(healthRes.data);
      if (mmRes.data.success) setMismatches(mmRes.data.mismatches || []);
      if (appRes.data.success) setApplications(appRes.data.applications || []);
    } catch (err) {
      setToast(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const takeAction = async (mismatch, action) => {
    setBusyId(`${mismatch.id}-${action}`);
    try {
      const res = await api.post(`/identity/mismatches/${mismatch.id}/action`, {
        action,
        notes:
          action === 'VERIFY'
            ? 'Officer confirmed the records refer to the same individual.'
            : action === 'INITIATE_CORRECTION'
            ? 'Correction request raised to source department registry custodian.'
            : 'Record examined and marked as reviewed by desk officer.'
      });
      if (res.data.success) {
        setToast(`${res.data.message} — ${mismatch.citizen_id}`);
        const mmRes = await api.get('/identity/mismatches');
        if (mmRes.data.success) setMismatches(mmRes.data.mismatches || []);
      }
    } catch (err) {
      setToast(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center space-x-2 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
        <span>Connecting to interoperability telemetry bus...</span>
      </div>
    );
  }

  const metrics = health?.metrics || {};
  const pending = mismatches.filter((m) => m.status === 'PENDING_REVIEW' || m.status === 'FLAGGED_MISMATCH');
  const resolved = mismatches.filter((m) => m.status === 'VERIFIED_MATCH' || m.status === 'CORRECTION_INITIATED');
  const filtered = statusFilter === 'ALL' ? mismatches : mismatches.filter((m) => m.status === statusFilter);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span>State Desk Officer Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identity discrepancy adjudication, interoperability health monitoring and departmental request oversight.
          </p>
        </div>
        <button
          onClick={loadAll}
          className="self-start text-xs font-semibold text-slate-600 hover:text-orange-600 border rounded px-2 py-1 flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {toast && (
        <div className="bg-slate-900 text-white text-xs rounded p-2 flex justify-between items-center">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-slate-400 hover:text-white">dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center">
            <Database className="w-3 h-3 mr-1" /> Connected Systems
          </span>
          <div className="text-xl font-bold text-slate-900">{metrics.connectedSystems}</div>
          <span className="text-[10px] text-emerald-600">Adapters registered</span>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center">
            <Gauge className="w-3 h-3 mr-1" /> API Requests (24h)
          </span>
          <div className="text-xl font-bold text-slate-900">{metrics.totalApiRequests}</div>
          <span className="text-[10px] text-slate-500">
            {metrics.successfulRequests} ok • {metrics.failedRequests} failed
          </span>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" /> Pending Discrepancies
          </span>
          <div className="text-xl font-bold text-amber-600">{pending.length}</div>
          <span className="text-[10px] text-slate-500">{resolved.length} adjudicated</span>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center">
            <FileText className="w-3 h-3 mr-1" /> Applications Routed
          </span>
          <div className="text-xl font-bold text-purple-600">{applications.length}</div>
          <span className="text-[10px] text-slate-500">Awaiting department action</span>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <span className="text-xs font-bold flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Identity Discrepancy Review Queue
          </span>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'PENDING_REVIEW', 'FLAGGED_MISMATCH', 'VERIFIED_MATCH', 'CORRECTION_INITIATED'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  statusFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-2.5">Citizen</th>
                <th className="p-2.5">Field</th>
                <th className="p-2.5">Source A</th>
                <th className="p-2.5">Source B</th>
                <th className="p-2.5">Similarity</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                    No discrepancy records matching this filter.
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 align-top">
                  <td className="p-2.5">
                    <span className="font-mono text-[11px] font-bold block">{m.citizen_id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{String(m.id).split('-').slice(-1)[0]}</span>
                  </td>
                  <td className="p-2.5 font-semibold">{m.field_name}</td>
                  <td className="p-2.5 text-[11px] max-w-[180px]">
                    <span className="text-[10px] font-bold text-slate-500 block">{m.dept_a_code}</span>
                    <span>{m.dept_a_value}</span>
                  </td>
                  <td className="p-2.5 text-[11px] max-w-[180px]">
                    <span className="text-[10px] font-bold text-slate-500 block">{m.dept_b_code}</span>
                    <span>{m.dept_b_value}</span>
                  </td>
                  <td className="p-2.5">
                    <span className={`font-mono font-bold text-[11px] ${
                      m.confidence_score >= 0.85 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {Math.round((m.confidence_score || 0) * 100)}%
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] whitespace-nowrap ${
                      STATUS_STYLES[m.status] || 'bg-slate-200 text-slate-700'
                    }`}>
                      {String(m.status).replace(/_/g, ' ')}
                    </span>
                    {m.officer_notes && (
                      <div className="text-[10px] text-slate-500 mt-1 max-w-[200px]">{m.officer_notes}</div>
                    )}
                  </td>
                  <td className="p-2.5">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => takeAction(m, 'VERIFY')}
                        disabled={busyId === `${m.id}-VERIFY`}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-[10px] font-bold whitespace-nowrap"
                      >
                        {busyId === `${m.id}-VERIFY` ? 'Working...' : 'Verify Same Person'}
                      </button>
                      <button
                        onClick={() => takeAction(m, 'INITIATE_CORRECTION')}
                        disabled={busyId === `${m.id}-INITIATE_CORRECTION`}
                        className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-[10px] font-bold whitespace-nowrap"
                      >
                        {busyId === `${m.id}-INITIATE_CORRECTION` ? 'Working...' : 'Initiate Correction'}
                      </button>
                      <button
                        onClick={() => takeAction(m, 'REVIEW')}
                        disabled={busyId === `${m.id}-REVIEW`}
                        className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:bg-slate-300 text-white text-[10px] font-bold whitespace-nowrap"
                      >
                        {busyId === `${m.id}-REVIEW` ? 'Working...' : 'Mark Reviewed'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold flex justify-between items-center">
            <span>Department Adapter Health</span>
            <span className="text-[10px] text-slate-400">Live mock integration bus</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(health?.departments || []).map((d) => (
              <div key={d.code} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{d.code}</span>
                  <span className="text-[10px] text-slate-500">{d.name}</span>
                  <span className="text-[10px] text-slate-400 block">{d.category}</span>
                </div>
                <div className="text-right">
                  <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                    d.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.status}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-500 mt-1">{d.latencyMs} ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold flex justify-between items-center">
            <span>Applications Routed to Departments</span>
            <span className="text-[10px] text-slate-400">{applications.length} records</span>
          </div>
          {applications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No citizen applications filed in this session yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 8).map((a) => (
                <div key={a.id} className="p-3 text-xs flex justify-between items-center gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block">{a.service_title}</span>
                    <span className="text-[10px] text-slate-500">
                      {a.citizen_name || a.citizen_id} → {a.target_department}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">{a.id}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold text-[10px] whitespace-nowrap">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-[10px] text-slate-400">
        Note: Officer actions are appended to the tamper-evident audit ledger and synced to
        <span className="font-mono"> data_mismatches.officer_notes</span> for downstream adjudication.
      </div>
    </div>
  );
}
