import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, RefreshCw, Building2 } from 'lucide-react';

export default function LandingPage({ onGetStarted, onOfficerLogin }) {
  const departments = [
    { code: 'Aaple Sarkar', desc: 'Urban & Domicile Registries', status: 'Adapter Active' },
    { code: 'MahaDBT', desc: 'Direct Benefit Transfer & Welfare', status: 'Adapter Active' },
    { code: 'Mahabhulekh', desc: '7/12 Land Records & Mutation', status: 'Adapter Active' },
    { code: 'e-Panchayat', desc: 'Rural Gram Panchayat Records', status: 'Adapter Active' },
    { code: 'MAITRI', desc: 'MSME Single Window Clearances', status: 'Adapter Active' },
  ];

  return (
    <div className="flex-1 bg-slate-50">
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            <span>Government of Maharashtra • MSInS Interoperability Initiative</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            One Citizen. Multiple Services.<br />
            <span className="text-orange-400">One Connected Platform.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Connecting Aaple Sarkar, MahaDBT, Mahabhulekh, e-Panchayat, and MAITRI through consent-driven digital interoperability.
          </p>

          <p className="max-w-2xl mx-auto text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            <span className="text-amber-400 font-semibold uppercase tracking-wide">SIH 2026 Demo Prototype</span>
            {' '}— Fictional Citizen Data • Mock Government Integrations. Built to demonstrate Problem Statement 26129.
            <span className="block mt-0.5 text-slate-300">Not an official Government of Maharashtra service.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg shadow transition flex items-center space-x-2 text-sm"
            >
              <span>Access Citizen Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOfficerLogin}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg transition text-sm flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>Department Officer Console</span>
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto -mt-5 px-4">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {departments.map((dept, idx) => (
            <div key={idx} className="border-r last:border-r-0 border-slate-100 pr-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{dept.code}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{dept.desc}</p>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.2 rounded border border-emerald-200 inline-block mt-1">
                {dept.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Department Adapters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardizes conflicting schemas (citizenName vs full_name vs owner_name) into unified canonical records.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Consent-Driven Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consent-based, purpose-bound data access. No department reads land or tax records without citizen authorization.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Identity &amp; Data Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-department identity and data matching. Deterministic string algorithms flag middle-initial and
              spelling discrepancies without breaking data flows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
