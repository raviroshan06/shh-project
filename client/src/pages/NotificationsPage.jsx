import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage({ setActivePage }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildFeed();
  }, [user]);

  const buildFeed = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profRes, consentRes, appRes] = await Promise.all([
        api.get('/citizen/profile'),
        api.get(`/consent/${user.id}`),
        api.get('/services/applications')
      ]);

      const feed = [];

      // 1. Data inconsistency advisories
      const mismatches = profRes.data?.matching?.mismatches || [];
      mismatches.forEach((m) => {
        feed.push({
          id: `MM-${m.id}`,
          type: 'WARNING',
          icon: AlertTriangle,
          title: `${m.field} inconsistency detected across departments`,
          body: `${m.systemA} holds "${m.valueA}" while ${m.systemB} holds "${m.valueB}" (${Math.round((m.confidenceScore || 0) * 100)}% similarity). An officer may verify this record.`,
          action: 'profile',
          actionLabel: 'Review in Unified Profile'
        });
      });

      // 2. Consent alerts
      const consents = consentRes.data?.consents || [];
      consents.forEach((c) => {
        if (c.status === 'GRANTED') {
          const daysLeft = Math.ceil((new Date(c.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
          feed.push({
            id: `CS-${c.id}`,
            type: daysLeft <= 10 ? 'WARNING' : 'INFO',
            icon: ShieldCheck,
            title: `${c.requesting_dept_name || c.requesting_dept} holds active data access`,
            body: `Purpose: ${c.purpose}. Authorization expires in ${daysLeft} day(s). You may revoke this at any time.`,
            action: 'consent',
            actionLabel: 'Manage Consent'
          });
        } else {
          feed.push({
            id: `CS-${c.id}`,
            type: 'INFO',
            icon: ShieldCheck,
            title: `Access revoked for ${c.requesting_dept_name || c.requesting_dept}`,
            body: `Consent ${c.id} is ${c.status}. The department can no longer query your records.`,
            action: 'history',
            actionLabel: 'View Audit Trail'
          });
        }
      });

      // 3. Application updates
      (appRes.data?.applications || []).forEach((a) => {
        feed.push({
          id: `APP-${a.id}`,
          type: 'SUCCESS',
          icon: FileText,
          title: `${a.service_title} — ${a.status}`,
          body: `Application ${a.id} filed to ${a.target_department} on ${new Date(a.created_at).toLocaleDateString('en-IN')}. Verified data was attached automatically.`,
          action: 'applications',
          actionLabel: 'Track Application'
        });
      });

      // 4. Positive interoperability signal
      if (mismatches.length === 0 && profRes.data?.success) {
        feed.push({
          id: 'OK-INTEROP',
          type: 'SUCCESS',
          icon: CheckCircle2,
          title: 'All linked departmental records are consistent',
          body: `MahaSetu verified your identity across ${profRes.data.availableSources?.length || 0} live registry adapters. No action needed.`,
          action: 'profile',
          actionLabel: 'View Provenance'
        });
      }

      setItems(feed);
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
        <span>Compiling notifications from gateway events...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-4">
      <div className="bg-white rounded-xl shadow border p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <span>Notification Centre</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Proactive alerts on data inconsistencies, consent validity and application progress.
          </p>
        </div>
        <button
          onClick={buildFeed}
          className="text-xs font-semibold text-slate-600 hover:text-orange-600 border rounded px-2 py-1 flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((it) => {
          const Icon = it.icon;
          const tone =
            it.type === 'WARNING'
              ? 'border-amber-300 bg-amber-50'
              : it.type === 'SUCCESS'
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-200 bg-white';
          const iconTone =
            it.type === 'WARNING'
              ? 'text-amber-600'
              : it.type === 'SUCCESS'
              ? 'text-emerald-600'
              : 'text-blue-600';

          return (
            <div key={it.id} className={`border rounded-xl p-3 flex gap-3 ${tone}`}>
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconTone}`} />
              <div className="flex-1 space-y-1">
                <div className="text-sm font-bold text-slate-900">{it.title}</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">{it.body}</div>
                <button
                  onClick={() => setActivePage(it.action)}
                  className="text-[11px] font-semibold text-orange-700 hover:text-orange-900 underline"
                >
                  {it.actionLabel}
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="bg-white border rounded-xl p-8 text-center text-xs text-slate-500">
            No notifications right now.
          </div>
        )}
      </div>
    </div>
  );
}
