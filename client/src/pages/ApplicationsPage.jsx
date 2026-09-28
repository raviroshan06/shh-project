import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, ChevronDown, ChevronUp, Database, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/applications');
      if (res.data.success) setApplications(res.data.applications || []);
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
        <span>Loading application ledger...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-orange-600" />
            <span>Application Tracking &amp; Evidence Snapshots</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every submission stores an immutable snapshot of the verified interoperable data used at filing time.
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="text-xs font-semibold text-slate-600 hover:text-orange-600 border rounded px-2 py-1 flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Filed</span>
          <div className="text-lg font-bold text-slate-900">{applications.length}</div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Submitted</span>
          <div className="text-lg font-bold text-blue-600">
            {applications.filter((a) => a.status === 'SUBMITTED').length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Departments Reached</span>
          <div className="text-lg font-bold text-slate-900">
            {new Set(applications.map((a) => a.target_department)).size}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Manual Uploads Required</span>
          <div className="text-lg font-bold text-emerald-600">0</div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-xs text-slate-500">
          No applications filed yet. Head to <strong>Gov Services</strong> and file one with a single click.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            let snapshot = {};
            try { snapshot = JSON.parse(app.payload_snapshot); } catch (e) { snapshot = {}; }
            const open = expanded === app.id;

            return (
              <div key={app.id} className="bg-white border rounded-xl overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{app.service_title}</span>
                      <span className="bg-slate-100 border text-slate-600 rounded px-1.5 py-0.5 text-[10px] font-bold">
                        {app.target_department}
                      </span>
                      <span className="bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 text-[10px] font-bold">
                        {app.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span className="font-mono">{app.id}</span>
                      {app.citizen_name && <span>Applicant: <strong>{app.citizen_name}</strong></span>}
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(app.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpanded(open ? null : app.id)}
                    className="self-start sm:self-center text-xs font-semibold text-slate-600 hover:text-orange-600 border rounded px-2 py-1 flex items-center space-x-1"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{open ? 'Hide Snapshot' : 'View Reused Data'}</span>
                    {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {open && (
                  <div className="border-t bg-slate-50 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Verified Evidence Snapshot (auto-attached at filing)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white border rounded p-2">
                        <span className="text-slate-400 block text-[10px] font-mono">canonicalName</span>
                        <span className="font-semibold text-slate-800">{snapshot.canonicalName}</span>
                      </div>
                      <div className="bg-white border rounded p-2">
                        <span className="text-slate-400 block text-[10px] font-mono">dateOfBirth</span>
                        <span className="font-semibold text-slate-800">{snapshot.dateOfBirth}</span>
                      </div>
                      <div className="bg-white border rounded p-2">
                        <span className="text-slate-400 block text-[10px] font-mono">mobile</span>
                        <span className="font-semibold text-slate-800">{snapshot.mobile}</span>
                      </div>
                      <div className="bg-white border rounded p-2 col-span-2">
                        <span className="text-slate-400 block text-[10px] font-mono">address</span>
                        <span className="font-semibold text-slate-800">{snapshot.address}</span>
                      </div>
                      <div className="bg-white border rounded p-2">
                        <span className="text-slate-400 block text-[10px] font-mono">district</span>
                        <span className="font-semibold text-slate-800">{snapshot.district}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-3">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sources reused: <strong>{(snapshot.sourceSystemsReused || []).join(', ')}</strong></span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        verifiedAt: {snapshot.verifiedAt ? new Date(snapshot.verifiedAt).toLocaleString('en-IN') : '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
