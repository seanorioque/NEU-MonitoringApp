// src/pages/DashboardPage.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { MOA, College } from '../types/Index';
import { COLLEGES, getStatusGroup } from '../types/Index';
import { CheckCircle2, Clock, AlertTriangle, XCircle, TrendingUp, Filter, BarChart3, X } from 'lucide-react';

interface Props { moas: MOA[]; userRole: string; }

export const DashboardPage: React.FC<Props> = ({ moas, userRole }) => {
  const [collegeFilter, setCollegeFilter] = useState<College | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // First apply role-based filter, then user-selected filters
  const filtered = useMemo(() => {
    return moas.filter(m => {
      // Always exclude deleted
      if (m.isDeleted) return false;

      // Student only sees APPROVED statuses
      if (userRole === 'student' && getStatusGroup(m.status) !== 'APPROVED') return false;

      // User-selected filters
      if (collegeFilter !== 'ALL' && m.endorsedByCollege !== collegeFilter) return false;
      if (dateFrom && m.effectiveDate < new Date(dateFrom)) return false;
      if (dateTo && m.effectiveDate > new Date(dateTo)) return false;

      return true;
    });
  }, [moas, userRole, collegeFilter, dateFrom, dateTo]);

  const stats = useMemo(() => ({
    approved:   filtered.filter(m => getStatusGroup(m.status) === 'APPROVED').length,
    processing: filtered.filter(m => getStatusGroup(m.status) === 'PROCESSING').length,
    expiring:   filtered.filter(m => getStatusGroup(m.status) === 'EXPIRING').length,
    expired:    filtered.filter(m => getStatusGroup(m.status) === 'EXPIRED').length,
    total:      filtered.length,
  }), [filtered]);

  const byCollege = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { map[m.endorsedByCollege] = (map[m.endorsedByCollege] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byIndustry = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { map[m.industryType] = (map[m.industryType] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const hasFilters = collegeFilter !== 'ALL' || dateFrom || dateTo;

  // Student only sees approved stat card, others see all 4
  const statCards = userRole === 'student'
    ? [{ label: 'Active & Approved', value: stats.approved, icon: CheckCircle2, accent: '#10B981', lightBg: '#F0FDF4', border: '#BBF7D0' }]
    : [
        { label: 'Active & Approved', value: stats.approved,   icon: CheckCircle2,  accent: '#10B981', lightBg: '#F0FDF4', border: '#BBF7D0' },
        { label: 'In Processing',     value: stats.processing, icon: Clock,         accent: '#F59E0B', lightBg: '#FFFBEB', border: '#FDE68A' },
        { label: 'Expiring Soon',     value: stats.expiring,   icon: AlertTriangle, accent: '#F97316', lightBg: '#FFF7ED', border: '#FED7AA' },
        { label: 'Expired',           value: stats.expired,    icon: XCircle,       accent: '#EF4444', lightBg: '#FEF2F2', border: '#FECACA' },
      ];

  const gridCols = userRole === 'student' ? '1fr' : 'repeat(4, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {stats.total} MOA{stats.total !== 1 ? 's' : ''} · {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={14} color="#8B7355" />
          <span style={{ fontSize: '12px', color: '#8B7355' }}>{stats.total} total records shown</span>
        </div>
      </div>

      {/* Role badge */}
      {userRole === 'student' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 size={14} color="#16A34A" />
          
        </div>
      )}

      {/* Filters */}
      <div className="section-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
            <Filter size={13} color="#C9A84C" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Filter</span>
          </div>
          <select
            value={collegeFilter}
            onChange={e => setCollegeFilter(e.target.value as College | 'ALL')}
            className="neu-input" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="ALL">All Colleges</option>
            {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="neu-input" style={{ width: 'auto' }} />
          <span style={{ color: '#8B7355', fontSize: '12px' }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="neu-input" style={{ width: 'auto' }} />
          {hasFilters && (
            <button
              onClick={() => { setCollegeFilter('ALL'); setDateFrom(''); setDateTo(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 10px', borderRadius: '8px', border: '1px solid #EDE5D8', background: 'white', color: '#8B7355', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '14px' }}>
        {statCards.map(({ label, value, icon: Icon, accent, lightBg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ background: lightBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}
            whileHover={{ y: -2, boxShadow: `0 8px 24px ${accent}20` }}
          >
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '70px', height: '70px', borderRadius: '50%', background: `${accent}18` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '11px', color: accent, fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '36px', fontWeight: 800, color: '#0B1B3D', lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{value}</p>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={accent} />
              </div>
            </div>
            <div style={{ marginTop: '14px', height: '4px', borderRadius: '99px', background: `${accent}20` }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.total ? (value / stats.total) * 100 : 0}%` }}
                transition={{ delay: i * 0.07 + 0.2, duration: 0.7 }}
                style={{ height: '100%', borderRadius: '99px', background: accent }}
              />
            </div>
            <p style={{ fontSize: '11px', color: accent, marginTop: '6px', fontWeight: 500 }}>
              {stats.total ? Math.round((value / stats.total) * 100) : 0}% of total
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* By College */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="section-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={15} color="#C9A84C" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D', fontFamily: 'Syne, sans-serif' }}>MOAs by College</h3>
          </div>
          {byCollege.length === 0
            ? <p style={{ fontSize: '12px', color: '#8B7355', textAlign: 'center', padding: '20px 0' }}>No data available</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {byCollege.map(([college, count]) => (
                  <div key={college}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#2D2416' }}>{college}</span>
                      <span style={{ color: '#8B7355', fontWeight: 500 }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: '#F0EAE0', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / (byCollege[0]?.[1] || 1)) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #C9A84C, #E8C96E)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
          }
        </motion.div>

        {/* By Industry */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="section-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={15} color="#C9A84C" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D', fontFamily: 'Syne, sans-serif' }}>By Industry</h3>
          </div>
          {byIndustry.length === 0
            ? <p style={{ fontSize: '12px', color: '#8B7355', textAlign: 'center', padding: '20px 0' }}>No data available</p>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {byIndustry.map(([industry, count]) => (
                  <div key={industry} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '99px',
                    background: '#FDF8F0', border: '1px solid #EDE5D8',
                    fontSize: '12px', color: '#2D2416',
                  }}>
                    <span style={{ fontWeight: 500 }}>{industry}</span>
                    <span style={{ background: '#C9A84C', color: '#0B1B3D', borderRadius: '99px', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>{count}</span>
                  </div>
                ))}
              </div>
          }

          {/* Expiring alert — only show for non-students */}
          {userRole !== 'student' && stats.expiring > 0 && (
            <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '10px', background: '#FFF7ED', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} color="#F97316" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#C2410C' }}>
                <strong>{stats.expiring}</strong> MOA{stats.expiring > 1 ? 's are' : ' is'} expiring within 2 months
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};