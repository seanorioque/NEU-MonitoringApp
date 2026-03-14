// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Users, LogOut,
  Building2, History, ChevronRight, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (v: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { currentUser, signOut } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

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

  const links = currentUser?.role === 'admin' ? adminLinks
    : currentUser?.role === 'faculty' ? facultyLinks
    : studentLinks;

  const roleLabel = currentUser?.role === 'admin' ? 'Administrator'
    : currentUser?.role === 'faculty' ? 'Faculty' : 'Student';

  const roleColor = currentUser?.role === 'admin' ? '#F87171'
    : currentUser?.role === 'faculty' ? '#60A5FA' : '#34D399';

  return (
    <div className="app-sidebar">
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #C9A84C, #E8C96E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(201,168,76,0.4)',
          }}>
            <Building2 size={18} color="#0B1B3D" />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>NEU MOA</p>
            <p style={{ color: 'rgba(201,168,76,0.65)', fontSize: '10px', marginTop: '3px', letterSpacing: '0.04em' }}>Monitoring System</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {currentUser?.photoURL
            ? <img src={currentUser.photoURL} style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} alt="" />
            : <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: '#C9A84C', color: '#0B1B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                {currentUser?.displayName?.[0] || 'U'}
              </div>
          }
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.displayName}
            </p>
            <p style={{ fontSize: '10px', fontWeight: 600, color: roleColor, marginTop: '2px' }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 6px 8px', marginBottom: '2px' }}>
          Navigation
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`nav-item ${currentView === id ? 'active' : ''}`}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {currentView === id && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            </button>
          ))}
        </div>

        {/* Admin badge */}
        {currentUser?.role === 'admin' && (
          <div style={{
            marginTop: '16px', padding: '8px 10px', borderRadius: '8px',
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <ShieldCheck size={12} color="#F87171" />
            <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 500 }}>Admin privileges active</span>
          </div>
        )}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {confirmSignOut ? (
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <p style={{ color: '#FCA5A5', fontSize: '11px', marginBottom: '8px', textAlign: 'center' }}>Sign out?</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={signOut} style={{ flex: 1, padding: '6px', borderRadius: '7px', background: '#EF4444', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Yes</button>
              <button onClick={() => setConfirmSignOut(false)} style={{ flex: 1, padding: '6px', borderRadius: '7px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer' }}>No</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmSignOut(true)} className="nav-item" style={{ color: 'rgba(248,113,113,0.7)' }}>
            <LogOut size={14} />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};