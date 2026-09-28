import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  UserCheck, 
  LogOut, 
  LayoutDashboard, 
  History, 
  Layers, 
  Activity,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOfficer = user?.role === 'GOVERNMENT_OFFICER';

  const citizenNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Unified Profile', icon: UserCheck },
    { id: 'consent', label: 'Consent Manager', icon: ShieldCheck },
    { id: 'services', label: 'Gov Services', icon: Layers },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'history', label: 'Audit History', icon: History },
  ];

  const officerNav = [
    { id: 'officer', label: 'Officer Console', icon: Activity },
    { id: 'history', label: 'Audit Ledger', icon: History },
  ];

  const currentNav = isOfficer ? officerNav : citizenNav;

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="bg-slate-950 px-4 py-1 border-b border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-orange-400">महाराष्ट्र शासन</span>
          <span>•</span>
          <span>Government of Maharashtra</span>
          <span>•</span>
          <span className="hidden sm:inline">Maharashtra State Innovation Society</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="hidden md:inline text-slate-500">Demo Prototype — not an official Govt. service</span>
          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wide">
            SIH 2026 Demo
          </span>
          <span className="bg-orange-600/30 text-orange-300 px-2 py-0.5 rounded font-mono text-[10px]">
            SIH Problem ID: 26129
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActivePage('landing')}
          >
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg text-white font-black text-xl shadow-md border border-orange-400/40">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white">MAHASETU</span>
                <span className="text-xs bg-orange-500/20 text-orange-400 font-semibold px-1.5 py-0.5 rounded border border-orange-500/30">
                  महासेतू
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Unified Government Digital Services & Interoperability Platform
              </p>
            </div>
          </div>

          {user ? (
            <nav className="hidden lg:flex items-center space-x-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                      active
                        ? 'bg-orange-600 text-white shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="h-6 w-px bg-slate-700 mx-2" />

              <div className="flex items-center space-x-3 pl-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-white leading-tight">
                    {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                    isOfficer ? 'bg-purple-900/60 text-purple-300' : 'bg-emerald-900/60 text-emerald-300'
                  }`}>
                    {isOfficer ? 'Officer' : 'Citizen'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActivePage('login')}
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-md shadow transition"
              >
                Sign In
              </button>
            </div>
          )}

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
