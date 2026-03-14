// src/components/Sidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Users, LogOut,
  Building2, ShieldCheck, History, Search
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (v: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { currentUser, signOut } = useAuth();

  const studentLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'moas', icon: FileText, label: 'Active MOAs' },
  ];

  const facultyLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'moas', icon: FileText, label: 'MOA List' },
    ...(currentUser?.canMaintainMOA ? [{ id: 'manage', icon: Building2, label: 'Manage MOAs' }] : []),
  ];

  const adminLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'moas', icon: FileText, label: 'All MOAs' },
    { id: 'manage', icon: Building2, label: 'Manage MOAs' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'audit', icon: History, label: 'Audit Trail' },
  ];

  const links = currentUser?.role === 'admin'
    ? adminLinks
    : currentUser?.role === 'faculty'
    ? facultyLinks
    : studentLinks;

  const roleLabel = currentUser?.role === 'admin' ? 'Administrator'
    : currentUser?.role === 'faculty' ? 'Faculty'
    : 'Student';

  const roleColor = currentUser?.role === 'admin' ? 'text-red-300'
    : currentUser?.role === 'faculty' ? 'text-blue-300'
    : 'text-green-300';

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-64 min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0B1B3D 0%, #0d2247 100%)',
        borderRight: '1px solid rgba(201,168,76,0.2)',
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96E)' }}>
            <Building2 size={18} style={{ color: '#0B1B3D' }} />
          </div>
          <div>
            <h1 className="font-syne font-bold text-white text-base leading-none">NEU MOA</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(201,168,76,0.8)' }}>Monitoring System</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-4 mb-4 p-3 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="flex items-center gap-2.5">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: '#C9A84C', color: '#0B1B3D' }}>
              {currentUser?.displayName?.[0] || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{currentUser?.displayName}</p>
            <p className={`text-xs font-medium ${roleColor}`}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-3" style={{ background: 'rgba(201,168,76,0.15)' }} />

      {/* Nav */}
      <nav className="px-3 flex-1 space-y-1">
        {links.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`nav-item w-full text-left ${currentView === id ? 'active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2">
        {currentUser?.role === 'admin' && (
          <div className="flex items-center gap-2 px-3 py-1.5">
            <ShieldCheck size={14} style={{ color: '#C9A84C' }} />
            <span className="text-xs" style={{ color: 'rgba(201,168,76,0.7)' }}>Admin Privileges</span>
          </div>
        )}
        <button
          onClick={signOut}
          className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
};