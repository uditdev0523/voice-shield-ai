import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { AudioUploadPage } from './pages/AudioUploadPage';
import { BankingSimulatorPage } from './pages/BankingSimulatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { InvestigationHistoryPage } from './pages/InvestigationHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentationPage } from './pages/DocumentationPage';

import { api } from './services/api';
import { SystemHealth } from './services/types';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        {!isLanding && (
          <div className="desktop-sidebar-container" style={{ display: 'none' }}>
            <Sidebar
              modelAvailable={health?.model.available}
              modelVersion={health?.model.version}
            />
          </div>
        )}

        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/live-detection" element={<LiveDetectionPage />} />
            <Route path="/upload-analysis" element={<AudioUploadPage />} />
            <Route path="/banking-simulator" element={<BankingSimulatorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/privacy-center" element={<PrivacyCenterPage />} />
            <Route path="/model-performance" element={<ModelPerformancePage />} />
            <Route path="/investigation-history" element={<InvestigationHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>

      <Footer />

      <style>{`
        @media (min-width: 992px) {
          .desktop-sidebar-container { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

export default App;
