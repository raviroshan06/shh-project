import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import UnifiedProfilePage from './pages/UnifiedProfilePage';
import ConsentPage from './pages/ConsentPage';
import ServicesPage from './pages/ServicesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import OfficerDashboard from './pages/OfficerDashboard';

export default function App() {
  const { user, loginWithPersona, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user) {
      setActivePage(user.role === 'GOVERNMENT_OFFICER' ? 'officer' : 'dashboard');
    } else {
      setActivePage('landing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSelectPersona = async (identifier) => {
    setSwitching(true);
    const res = await loginWithPersona(identifier, '123456');
    setSwitching(false);
    if (!res.success) {
      setActivePage('login');
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setActivePage(loggedInUser.role === 'GOVERNMENT_OFFICER' ? 'officer' : 'dashboard');
  };

  const renderPage = () => {
    if (loading || switching) {
      return (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500 py-16">
          Establishing secure interoperability session...
        </div>
      );
    }

    if (!user) {
      if (activePage === 'login') return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      return (
        <LandingPage
          onGetStarted={() => setActivePage('login')}
          onOfficerLogin={() => setActivePage('login')}
        />
      );
    }

    if (user.role === 'GOVERNMENT_OFFICER') {
      switch (activePage) {
        case 'history':
          return <HistoryPage />;
        case 'officer':
        default:
          return <OfficerDashboard />;
      }
    }

    switch (activePage) {
      case 'profile':
        return <UnifiedProfilePage />;
      case 'consent':
        return <ConsentPage />;
      case 'services':
        return <ServicesPage setActivePage={setActivePage} />;
      case 'applications':
        return <ApplicationsPage />;
      case 'notifications':
        return <NotificationsPage setActivePage={setActivePage} />;
      case 'history':
        return <HistoryPage />;
      case 'dashboard':
      default:
        return <CitizenDashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DemoBanner onSelectPersona={handleSelectPersona} currentPersonaId={user?.id} />
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {renderPage()}
      <footer className="mt-auto bg-slate-950 text-slate-400 text-[11px] py-4 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-2">
          <span>
            MAHASETU Prototype • SIH 2026 Problem Statement 26129 • Unified Government Digital Services &amp;
            Interoperability Platform
          </span>
          <span className="sm:text-right">
            SIH 2026 DEMO PROTOTYPE — Fictional Citizen Data • Mock Government Integrations.
            <span className="text-slate-300 font-semibold"> Not an official Government of Maharashtra service.</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
