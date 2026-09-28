import React, { useState, useEffect } from 'react';
import { CheckCircle, Layers, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CitizenDashboard({ setActivePage }) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/citizen/profile');
      if (res.data.success) setProfileData(res.data);

      if (user?.role === 'CITIZEN') {
        const cRes = await api.get(`/consent/${user.id}`);
        if (cRes.data.success) setConsents(cRes.data.consents || []);
      }
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
        <span>Aggregating citizen registries across Maharashtra departments...</span>
      </div>
    );
  }

  const normalized = profileData?.normalized;
  const matching = profileData?.matching;
  const sources = profileData?.sources || {};

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900">
              Welcome, {normalized?.canonicalName || user?.name}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-semibold flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            MahaSetu ID: <span className="font-mono font-bold text-slate-700">{user?.id}</span> • 
            Mobile: <span className="font-mono text-slate-700">{normalized?.mobile || user?.mobile}</span> • 
            District: <span className="font-medium text-slate-700">{normalized?.district}, Maharashtra</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActivePage('profile')}
            className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold flex items-center space-x-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActivePage('services')}
            className="px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-semibold flex items-center space-x-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Connected Systems</span>
          <div className="text-lg font-bold text-slate-900">{profileData?.availableSources?.length || 0} / 5 Active</div>
          <span className="text-[10px] text-emerald-600">Interoperability live</span>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Consistency</span>
          <div className="text-lg font-bold">
            <span className={matching?.overallStatus === 'MATCHED' ? 'text-emerald-600' : 'text-amber-600'}>
              {matching?.overallStatus === 'MATCHED' ? 'Aligned' : 'Discrepancy'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">{matching?.mismatchesCount || 0} flagged</span>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Active Consents</span>
          <div className="text-lg font-bold text-slate-900">
            {consents.filter((c) => c.status === 'GRANTED').length} Granted
          </div>
          <span className="text-[10px] text-blue-600">Consent-bound access</span>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Docs Reused</span>
          <div className="text-lg font-bold text-slate-900">
            {profileData?.availableSources?.length || 0} Registries
          </div>
          <span className="text-[10px] text-purple-600">Zero re-entry</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-3 space-y-2">
          <div className="flex justify-between items-center border-b pb-1 text-xs">
            <span className="font-bold">Consistency Summary</span>
            <button onClick={() => setActivePage('profile')} className="text-orange-600 font-semibold flex items-center">
              <span>Full Details</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-slate-50">
              <span>Citizen Name</span>
              <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${matching?.mismatches?.some(m => m.field === 'Name') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {matching?.mismatches?.some(m => m.field === 'Name') ? 'Initial Warning' : 'Matched'}
              </span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-50">
              <span>Date of Birth</span>
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">Matched</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-50">
              <span>Address & District</span>
              <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${matching?.mismatches?.some(m => m.field === 'Address') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {matching?.mismatches?.some(m => m.field === 'Address') ? 'Divergence' : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-3 space-y-2">
          <div className="flex justify-between items-center border-b pb-1 text-xs">
            <span className="font-bold">Connected Registries</span>
            <span className="text-slate-400 text-[10px]">Adapters</span>
          </div>
          <div className="space-y-1 text-xs">
            {[
              { name: 'Aaple Sarkar', desc: 'Civil Registries', ok: sources.aapleSarkar?.success },
              { name: 'MahaDBT', desc: 'Welfare Schemes', ok: sources.mahaDbt?.success },
              { name: 'Mahabhulekh', desc: '7/12 Land Records', ok: sources.mahabhulekh?.success },
              { name: 'e-Panchayat', desc: 'Rural Gram Panchayat', ok: sources.epanchayat?.success },
              { name: 'MAITRI', desc: 'Industrial Single Window', ok: sources.maitri?.success },
            ].map((s, idx) => (
              <div key={idx} className="flex justify-between p-1 rounded border border-slate-100">
                <span>{s.name} <span className="text-slate-400 text-[10px]">({s.desc})</span></span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${s.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.ok ? 'CONNECTED' : 'NOT LINKED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
