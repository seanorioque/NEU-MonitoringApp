// src/pages/DashboardPage.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { type MOA, type College, COLLEGES, getStatusGroup } from '../types/Index';
import { CheckCircle2, Clock, AlertTriangle, XCircle, TrendingUp, Filter } from 'lucide-react';

interface Props {
  moas: MOA[];
  userRole: string;
}

export const DashboardPage: React.FC<Props> = ({ moas, userRole }) => {
  const [collegeFilter, setCollegeFilter] = useState<College | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return moas.filter(m => {
      if (m.isDeleted) return false;
      if (userRole === 'student' && !getStatusGroup(m.status).startsWith('APPROVED')) return false;
      if (collegeFilter !== 'ALL' && m.endorsedByCollege !== collegeFilter) return false;
      if (dateFrom && m.effectiveDate < new Date(dateFrom)) return false;
      if (dateTo && m.effectiveDate > new Date(dateTo)) return false;
      return true;
    });
  }, [moas, collegeFilter, dateFrom, dateTo, userRole]);

  const stats = useMemo(() => {
    const approved = filtered.filter(m => getStatusGroup(m.status) === 'APPROVED').length;
    const processing = filtered.filter(m => getStatusGroup(m.status) === 'PROCESSING').length;
    const expiring = filtered.filter(m => getStatusGroup(m.status) === 'EXPIRING').length;
    const expired = filtered.filter(m => getStatusGroup(m.status) === 'EXPIRED').length;
    return { approved, processing, expiring, expired, total: filtered.length };
  }, [filtered]);

  const byCollege = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => {
      map[m.endorsedByCollege] = (map[m.endorsedByCollege] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byIndustry = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => {
      map[m.industryType] = (map[m.industryType] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const cards = [
    {
      label: 'Active & Approved',
      value: stats.approved,
      icon: CheckCircle2,
      color: '#10B981',
      bg: 'from-emerald-900/60 to-emerald-800/30',
      border: 'border-emerald-500/30',
    },
    {
      label: 'In Processing',
      value: stats.processing,
      icon: Clock,
      color: '#F59E0B',
      bg: 'from-amber-900/60 to-amber-800/30',
      border: 'border-amber-500/30',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiring,
      icon: AlertTriangle,
      color: '#F97316',
      bg: 'from-orange-900/60 to-orange-800/30',
      border: 'border-orange-500/30',
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: XCircle,
      color: '#EF4444',
      bg: 'from-red-900/60 to-red-800/30',
      border: 'border-red-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-syne font-bold" style={{ color: '#0B1B3D' }}>Dashboard</h2>
          <p className="text-sm text-neu-slate mt-1">MOA statistics overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neu-slate">
          <TrendingUp size={14} />
          <span>{stats.total} total records</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-neu-gold-pale shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} style={{ color: '#C9A84C' }} />
          <span className="text-xs font-medium font-syne uppercase tracking-widest text-neu-slate">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={collegeFilter}
            onChange={e => setCollegeFilter(e.target.value as College | 'ALL')}
            className="neu-input w-auto min-w-32"
          >
            <option value="ALL">All Colleges</option>
            {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="neu-input w-auto" placeholder="From" />
            <span className="text-neu-slate text-xs">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="neu-input w-auto" placeholder="To" />
          </div>
          {(collegeFilter !== 'ALL' || dateFrom || dateTo) && (
            <button onClick={() => { setCollegeFilter('ALL'); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-neu-gold underline">Clear filters</button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border} relative overflow-hidden`}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
              style={{ background: color }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/60 mb-2 font-dm">{label}</p>
                <p className="text-4xl font-syne font-bold text-white">{value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}25`, border: `1px solid ${color}40` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.total ? (value / stats.total) * 100 : 0}%`, background: color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By College */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 border border-neu-gold-pale shadow-sm"
        >
          <h3 className="font-syne font-semibold text-neu-navy mb-4 text-sm">MOAs by College</h3>
          <div className="space-y-2.5">
            {byCollege.length === 0 && <p className="text-xs text-neu-slate">No data</p>}
            {byCollege.map(([college, count]) => (
              <div key={college}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-neu-navy">{college}</span>
                  <span className="text-neu-slate">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-neu-gold-pale overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / (byCollege[0]?.[1] || 1)) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C96E)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* By Industry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl p-5 border border-neu-gold-pale shadow-sm"
        >
          <h3 className="font-syne font-semibold text-neu-navy mb-4 text-sm">MOAs by Industry</h3>
          <div className="flex flex-wrap gap-2">
            {byIndustry.length === 0 && <p className="text-xs text-neu-slate">No data</p>}
            {byIndustry.map(([industry, count]) => (
              <div key={industry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{ borderColor: '#C9A84C40', background: '#FDF8F0', color: '#0B1B3D' }}>
                <span>{industry}</span>
                <span className="text-neu-gold font-bold">{count}</span>
              </div>
            ))}
          </div>

          {/* Expiring alerts */}
          {stats.expiring > 0 && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2"
              style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
              <AlertTriangle size={14} className="text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700">
                <strong>{stats.expiring}</strong> MOA{stats.expiring > 1 ? 's are' : ' is'} expiring within 2 months
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};