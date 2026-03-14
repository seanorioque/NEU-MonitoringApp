// src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { MOAListPage } from './pages/MOAListPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditPage } from './pages/AuditPage';
import { getMOAs } from './services/moaService';
import type { MOA } from './types/index';
import { RefreshCw } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 100%)' }}>
    <div className="text-center">
      <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse"
        style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96E)' }}>
        <RefreshCw size={22} style={{ color: '#0B1B3D' }} className="animate-spin" />
      </div>
      <p className="font-syne font-bold text-white text-lg">NEU MOA System</p>
      <p className="text-sm mt-1" style={{ color: 'rgba(201,168,76,0.7)' }}>Initializing…</p>
    </div>
  </div>
);

const AppShell: React.FC = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState('dashboard');
  const [moas, setMoas] = useState<MOA[]>([]);
  const [moasLoading, setMoasLoading] = useState(true);

  const fetchMOAs = useCallback(async () => {
    if (!currentUser) return;
    setMoasLoading(true);
    try {
      const data = await getMOAs(currentUser.role);
      setMoas(data);
    } catch (err) {
      console.error('Failed to load MOAs:', err);
    } finally {
      setMoasLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchMOAs(); }, [fetchMOAs]);

  // Redirect students away from admin-only views
  useEffect(() => {
    if (currentUser?.role === 'student' && (view === 'users' || view === 'audit' || view === 'manage')) {
      setView('dashboard');
    }
    if (currentUser?.role === 'faculty' && (view === 'users' || view === 'audit')) {
      setView('dashboard');
    }
    if (currentUser?.role === 'faculty' && view === 'manage' && !currentUser.canMaintainMOA) {
      setView('dashboard');
    }
  }, [view, currentUser]);

  const renderPage = () => {
    if (moasLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw size={24} className="animate-spin text-neu-gold mx-auto mb-2" />
            <p className="text-sm text-neu-slate">Loading data…</p>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return <DashboardPage moas={moas} userRole={currentUser!.role} />;
      case 'moas':
        return <MOAListPage moas={moas} currentUser={currentUser!} onRefresh={fetchMOAs} />;
      case 'manage':
        if (currentUser?.role === 'admin' || currentUser?.canMaintainMOA) {
          return <MOAListPage moas={moas} currentUser={currentUser!} onRefresh={fetchMOAs} />;
        }
        return null;
      case 'users':
        if (currentUser?.role === 'admin') return <UserManagementPage />;
        return null;
      case 'audit':
        if (currentUser?.role === 'admin') return <AuditPage moas={moas} />;
        return null;
      default:
        return <DashboardPage moas={moas} userRole={currentUser!.role} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-neu-cream">
      <Sidebar currentView={view} setCurrentView={setView} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 px-8 py-4 border-b border-neu-gold-pale bg-neu-cream/80"
          style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neu-slate uppercase tracking-widest font-syne">
                New Era University
              </p>
              <h1 className="font-syne font-bold text-neu-navy text-base leading-tight">
                MOA Monitoring System
              </h1>
            </div>
            <button
              onClick={fetchMOAs}
              className="flex items-center gap-2 text-xs text-neu-slate hover:text-neu-gold transition-colors px-3 py-1.5 rounded-lg hover:bg-neu-gold/10"
            >
              <RefreshCw size={13} className={moasLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="p-8"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <LoginPage />;
  return <AppShell />;
};