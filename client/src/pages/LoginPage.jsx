import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithPersona } = useAuth();
  const [roleTab, setRoleTab] = useState('CITIZEN');
  const [identifier, setIdentifier] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickPersonas = [
    { id: 'MH-CIT-1001', name: 'Ravi Kumar', mobile: '9876543210', scenario: 'Name Mismatch' },
    { id: 'MH-CIT-1002', name: 'Anita Patil', mobile: '9822012345', scenario: 'Address Mismatch' },
    { id: 'MH-CIT-1003', name: 'Suresh Jadhav', mobile: '9423198765', scenario: 'Missing Record' },
    { id: 'MH-CIT-1004', name: 'Priya Deshmukh', mobile: '9158098765', scenario: 'All Matched' },
    { id: 'MH-CIT-1005', name: 'Amit Shinde', mobile: '9765432109', scenario: 'Multiple Mismatches' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    const target = roleTab === 'OFFICER' ? 'OFFICER-PUNE-01' : identifier;
    const res = await loginWithPersona(target, otp);
    setLoading(false);
    if (res.success && onLoginSuccess) onLoginSuccess(res.user);
    else if (!res.success) setError(res.message || 'Login failed');
  };

  return (
    <div className="flex-1 bg-slate-100 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-4 text-center">
          <div className="w-10 h-10 bg-orange-600 rounded mx-auto flex items-center justify-center mb-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold">MahaSetu Portal Sign In</h2>
          <p className="text-[11px] text-slate-400">Interoperable Identity Gateway</p>
        </div>

        <div className="flex border-b text-xs font-semibold">
          <button
            onClick={() => { setRoleTab('CITIZEN'); setIdentifier('9876543210'); }}
            className={`flex-1 py-2 text-center border-b-2 ${roleTab === 'CITIZEN' ? 'border-orange-600 text-orange-600 bg-white' : 'text-slate-500'}`}
          >
            Citizen Sign In (OTP)
          </button>
          <button
            onClick={() => { setRoleTab('OFFICER'); setIdentifier('OFFICER-PUNE-01'); }}
            className={`flex-1 py-2 text-center border-b-2 ${roleTab === 'OFFICER' ? 'border-orange-600 text-orange-600 bg-white' : 'text-slate-500'}`}
          >
            Desk Officer Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-4 space-y-3">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-2 rounded flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {roleTab === 'CITIZEN' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Demo OTP</label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">123456</span>
                </div>
                <input
                  type="password"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded text-sm"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Officer Service ID</label>
              <input
                type="text"
                value="OFFICER-PUNE-01 (Rajendra Deshmukh)"
                readOnly
                className="w-full px-3 py-1.5 border bg-slate-100 rounded text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-sm flex items-center justify-center space-x-1"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {roleTab === 'CITIZEN' && (
            <div className="pt-2 border-t">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Demo Scenarios:</span>
              <div className="space-y-1">
                {quickPersonas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setIdentifier(p.mobile); setOtp('123456'); }}
                    className={`w-full text-left px-2 py-1 rounded border text-xs flex justify-between ${identifier === p.mobile ? 'border-orange-500 bg-orange-50 font-semibold' : 'border-slate-200'}`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.scenario}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
