import React, { useState, useEffect } from 'react';
import { History, RefreshCw, ShieldCheck, Activity } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ACTION_STYLES = {
  PROFILE_AGGREGATION: 'bg-blue-100 text-blue-800',
  CONSENT_GRANTED: 'bg-emerald-100 text-emerald-800',
  CONSENT_REVOKED: 'bg-rose-100 text-rose-700',
  USER_LOGIN: 'bg-slate-200 text-slate-700',
  SERVICE_APPLICATION_FILED: 'bg-purple-100 text-purple-800',
  SERVICE_INITIALIZATION: 'bg-slate-200 text-slate-600',
  MISMATCH_VERIFY: 'bg-indigo-100 text-indigo-800',
  MISMATCH_INITIATE_CORRECTION: 'bg-rose-100 text-rose-800',
  MISMATCH_REVIEW: 'bg-slate-200 text-slate-700'
};

// Filters stay focused on the events a citizen/officer actually needs to slice by.
const ACTION_FILTERS = [
  'ALL',
  'PROFILE_AGGREGATION',
  'CONSENT_GRANTED',
  'CONSENT_REVOKED',
  'SERVICE_APPLICATION_FILED',
  'MISMATCH_VERIFY',
  'MISMATCH_INITIATE_CORRECTION',
  'USER_LOGIN'
];

export default function HistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit/logs?limit=100');
      if (res.data.success) setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center space-x-2 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
        <span>Fetching tamper-evident audit ledger...</span>
      </div>
    );
  }

  const isOfficer = user?.role === 'GOVERNMENT_OFFICER';
  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.action === filter);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-orange-600" />
            <span>{isOfficer ? 'State-wide Audit Ledger' : 'My Data Access History'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOfficer
              ? 'Immutable trail of every interoperability call, consent event and administrative decision.'
              : 'Every time a department accessed your data, it is recorded here — consent-based, purpose-bound access with full transparency.'}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="text-xs font-semibold text-slate-600 hover:text-orange-600 border rounded px-2 py-1 flex items-center space-x-1 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        {ACTION_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded border font-semibold ${
              filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Events</span>
          <div className="text-lg font-bold text-slate-900">{logs.length}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Aggregations</span>
          <div className="text-lg font-bold text-blue-600">
            {logs.filter((l) => l.action === 'PROFILE_AGGREGATION').length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Consent Events</span>
          <div className="text-lg font-bold text-emerald-600">
            {logs.filter((l) => String(l.action).startsWith('CONSENT')).length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Applications Filed</span>
          <div className="text-lg font-bold text-purple-600">
            {logs.filter((l) => l.action === 'SERVICE_APPLICATION_FILED').length}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-2.5">Timestamp (IST)</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Actor</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Data Accessed</th>
                <th className="p-2.5">Consent</th>
                <th className="p-2.5">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                    No audit events recorded for this filter.
                  </td>
                </tr>
              )}
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 align-top">
                  <td className="p-2.5 whitespace-nowrap text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] whitespace-nowrap ${
                      ACTION_STYLES[log.action] || 'bg-amber-100 text-amber-800'
                    }`}>
                      {String(log.action).replace(/_/g, ' ')}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 max-w-xs">{log.details}</div>
                  </td>
                  <td className="p-2.5">
                    <span className="font-mono text-[10px] block">{log.actor_id}</span>
                    <span className="text-[10px] text-slate-500">{log.actor_role}</span>
                  </td>
                  <td className="p-2.5 font-semibold text-[11px]">{log.department}</td>
                  <td className="p-2.5 text-[11px] max-w-xs">
                    <span className="block">{log.data_accessed}</span>
                    <span className="text-[10px] text-slate-500">{log.purpose}</span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                      log.consent_status === 'GRANTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.consent_status}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-[10px] text-slate-500">
                    <span className="flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-1 text-slate-400" />
                      {log.trace_id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
        <Activity className="w-3 h-3" />
        <span>
          Ledger entries are append-only. Each record carries a trace ID for cross-department forensic
          correlation. Repeated automatic aggregations of unchanged profile data are collapsed into a
          single entry; any change in linked registries, findings or officer adjudication is recorded again.
        </span>
      </div>
    </div>
  );
}
