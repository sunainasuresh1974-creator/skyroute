import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopNavbar from './components/TopNavbar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RoutesPage from './pages/RoutesPage.jsx';
import FareFinderPage from './pages/FareFinderPage.jsx';
import NetworkPlannerPage from './pages/NetworkPlannerPage.jsx';
import WaitlistPage from './pages/WaitlistPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function MainLayout() {
  const { activeTab } = useApp();
  const [isAddFlightModalOpen, setIsAddFlightModalOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onOpenAddFlightModal={() => setIsAddFlightModalOpen(true)} />;
      case 'routes':
        return (
          <RoutesPage
            isAddFlightModalOpen={isAddFlightModalOpen}
            setIsAddFlightModalOpen={setIsAddFlightModalOpen}
          />
        );
      case 'dijkstra':
        return <FareFinderPage />;
      case 'prim':
        return <NetworkPlannerPage />;
      case 'waitlist':
        return <WaitlistPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onOpenAddFlightModal={() => setIsAddFlightModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* 240px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area (Offset by 240px on lg screens) */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        {/* Sticky Topbar */}
        <TopNavbar onOpenAddFlightModal={() => setIsAddFlightModalOpen(true)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span className="font-medium">
              SkyRoute Operations Hub · Airline Route Network & Fare Management
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              DSA Core: Adjacency Matrix (V×V) · Dijkstra O(V²) · Prim O(V²) · Linear Queue
            </span>
          </div>
        </footer>
      </div>

      {/* Global Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
