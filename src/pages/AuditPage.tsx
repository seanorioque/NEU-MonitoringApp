// src/pages/AuditPage.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Plus, Edit2, Trash2, RefreshCw, Search, Filter } from 'lucide-react';
import { MOA, AuditEntry } from '../types';

interface FlatAudit extends AuditEntry {
  moaId: string;
  moaCompany: string;
  moaHteId: string;
}

interface Props {
  moas: MOA[];
}

const opIcon = (op: AuditEntry['operation']) => {
  switch (op) {
    case 'INSERT': return <Plus size={13} className="text-emerald-600" />;
    case 'UPDATE': return <Edit2 size={13} className="text-blue-600" />;
    case 'DELETE': return <Trash2 size={13} className="text-red-600" />;
    case 'RESTORE': return <RefreshCw size={13} className="text-purple-600" />;
  }
};

const opBadge = (op: AuditEntry['operation']) => {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border';
  switch (op) {
    case 'INSERT': return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
    case 'UPDATE': return `${base} bg-blue-50 text-blue-700 border-blue-200`;
    case 'DELETE': return `${base} bg-red-50 text-red-700 border-red-200`;
    case 'RESTORE': return `${base} bg-purple-50 text-purple-700 border-purple-200`;
  }
};

export const AuditPage: React.FC<Props> = ({ moas }) => {
  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState<AuditEntry['operation'] | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Flatten all audit entries from all MOAs
  const allAudits: FlatAudit[] = useMemo(() => {
    const entries: FlatAudit[] = [];
    moas.forEach(moa => {
      (moa.auditTrail || []).forEach(entry => {
        entries.push({
          ...entry,
          moaId: moa.id,
          moaCompany: moa.companyName,
          moaHteId: moa.hteId,
        });
      });
    });
    return entries.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [moas]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allAudits.filter(a => {
      if (opFilter !== 'ALL' && a.operation !== opFilter) return false;
      if (dateFrom && new Date(a.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(a.timestamp) > new Date(dateTo + 'T23:59:59')) return false;
      if (!q) return true;
      return (
        a.userName.toLowerCase().includes(q) ||
        a.userEmail.toLowerCase().includes(q) ||
        a.moaCompany.toLowerCase().includes(q) ||
        a.moaHteId.toLowerCase().includes(q)
      );
    });
  }, [allAudits, search, opFilter, dateFrom, dateTo]);

  const stats = {
    total: allAudits.length,
    inserts: allAudits.filter(a => a.operation === 'INSERT').length,
    updates: allAudits.filter(a => a.operation === 'UPDATE').length,
    deletes: allAudits.filter(a => a.operation === 'DELETE').length,
    restores: allAudits.filter(a => a.operation === 'RESTORE').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96E)' }}>
          <History size={18} style={{ color: '#0B1B3D' }} />
        </div>
        <div>
          <h2 className="text-2xl font-syne font-bold text-neu-navy">Audit Trail</h2>
          <p className="text-sm text-neu-slate">All system activity logs</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Events', value: stats.total, color: '#0B1B3D' },
          { label: 'Inserts', value: stats.inserts, color: '#16A34A' },
          { label: 'Updates', value: stats.updates, color: '#2563EB' },
          { label: 'Deletions', value: stats.deletes, color: '#DC2626' },
          { label: 'Restores', value: stats.restores, color: '#9333EA' },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 border border-neu-gold-pale shadow-sm text-center"
          >
            <p className="text-2xl font-syne font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-neu-slate mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neu-gold-pale shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-neu-slate" />
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neu-slate" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, email, company, HTE ID…"
            className="neu-input pl-9" />
        </div>
        <select value={opFilter}
          onChange={e => setOpFilter(e.target.value as typeof opFilter)}
          className="neu-input w-auto">
          <option value="ALL">All Operations</option>
          <option value="INSERT">Insert</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="RESTORE">Restore</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="neu-input w-auto" />
        <span className="text-neu-slate text-xs">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="neu-input w-auto" />
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-2xl border border-neu-gold-pale shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="moa-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Operation</th>
                <th>MOA / Company</th>
                <th>HTE ID</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neu-slate text-sm">
                    No audit records found
                  </td>
                </tr>
              )}
              {filtered.map((entry, i) => (
                <motion.tr
                  key={`${entry.moaId}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                >
                  <td className="text-xs text-neu-slate whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-PH', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </td>
                  <td>
                    <p className="text-sm font-medium text-neu-navy">{entry.userName}</p>
                    <p className="text-xs text-neu-slate">{entry.userEmail}</p>
                  </td>
                  <td>
                    <span className={opBadge(entry.operation)}>
                      {opIcon(entry.operation)}
                      {entry.operation}
                    </span>
                  </td>
                  <td className="text-sm text-neu-navy font-medium">{entry.moaCompany}</td>
                  <td className="font-mono text-xs text-neu-slate">{entry.moaHteId}</td>
                  <td>
                    {entry.changes && Object.keys(entry.changes).length > 0 ? (
                      <div className="space-y-1 max-w-xs">
                        {Object.entries(entry.changes).map(([field, change]) => (
                          <div key={field} className="text-xs">
                            <span className="font-medium text-neu-navy capitalize">{field}: </span>
                            <span className="text-red-500 line-through">{String(change.before).slice(0, 30)}</span>
                            <span className="text-neu-slate mx-1">→</span>
                            <span className="text-emerald-600">{String(change.after).slice(0, 30)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neu-slate italic">No field changes</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-neu-gold-pale bg-neu-cream/50">
          <p className="text-xs text-neu-slate">
            Showing {filtered.length} of {allAudits.length} audit entries
          </p>
        </div>
      </div>
    </div>
  );
};