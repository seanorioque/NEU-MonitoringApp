// src/pages/AuditPage.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Plus, Edit2, Trash2, RefreshCw, Search, Filter } from 'lucide-react';
import type { MOA, AuditEntry } from '../types/Index';

interface FlatAudit extends AuditEntry { moaId: string; moaCompany: string; moaHteId: string; }
interface Props { moas: MOA[]; }

const OP_STYLES = {
  INSERT:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', icon: Plus },
  UPDATE:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', icon: Edit2 },
  DELETE:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', icon: Trash2 },
  RESTORE: { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF', icon: RefreshCw },
};

export const AuditPage: React.FC<Props> = ({ moas }) => {
  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState<AuditEntry['operation'] | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const allAudits: FlatAudit[] = useMemo(() => {
    const entries: FlatAudit[] = [];
    moas.forEach(moa => {
      (moa.auditTrail || []).forEach(entry => entries.push({ ...entry, moaId: moa.id, moaCompany: moa.companyName, moaHteId: moa.hteId }));
    });
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [moas]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allAudits.filter(a => {
      if (opFilter !== 'ALL' && a.operation !== opFilter) return false;
      if (dateFrom && new Date(a.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(a.timestamp) > new Date(dateTo + 'T23:59:59')) return false;
      if (!q) return true;
      return [a.userName, a.userEmail, a.moaCompany, a.moaHteId].some(v => v.toLowerCase().includes(q));
    });
  }, [allAudits, search, opFilter, dateFrom, dateTo]);

  const stats = { total: allAudits.length, INSERT: allAudits.filter(a => a.operation === 'INSERT').length, UPDATE: allAudits.filter(a => a.operation === 'UPDATE').length, DELETE: allAudits.filter(a => a.operation === 'DELETE').length, RESTORE: allAudits.filter(a => a.operation === 'RESTORE').length };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #C9A84C, #E8C96E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={18} color="#0B1B3D" />
          </div>
          <div>
            <h1 className="page-title">Audit Trail</h1>
            <p className="page-subtitle">All system activity across all MOA records</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {([['Total Events', stats.total, '#0B1B3D', '#F0EAE0'], ['Inserts', stats.INSERT, '#16A34A', '#F0FDF4'], ['Updates', stats.UPDATE, '#2563EB', '#EFF6FF'], ['Deletions', stats.DELETE, '#DC2626', '#FEF2F2'], ['Restores', stats.RESTORE, '#9333EA', '#FAF5FF']] as const).map(([label, value, color, bg], i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: bg, border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '11px', color: '#8B7355', marginTop: '4px', fontWeight: 500 }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="section-card" style={{ padding: '12px 14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={13} color="#8B7355" />
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} color="#8B7355" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, email, company, HTE ID…" className="neu-input" style={{ paddingLeft: '36px' }} />
        </div>
        <select value={opFilter} onChange={e => setOpFilter(e.target.value as typeof opFilter)} className="neu-input" style={{ width: 'auto' }}>
          <option value="ALL">All Operations</option>
          <option value="INSERT">Insert</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="RESTORE">Restore</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="neu-input" style={{ width: 'auto' }} />
        <span style={{ color: '#8B7355', fontSize: '12px' }}>—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="neu-input" style={{ width: 'auto' }} />
      </div>

      {/* Table */}
      <div className="section-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table className="moa-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Operation</th>
                <th>Company / MOA</th>
                <th>HTE ID</th>
                <th>Field Changes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#8B7355' }}>No audit records found</td></tr>}
              {filtered.map((entry, i) => {
                const op = OP_STYLES[entry.operation];
                const OpIcon = op.icon;
                return (
                  <motion.tr key={`${entry.moaId}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.25) }}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#6B5E4E' }}>
                      {new Date(entry.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0B1B3D' }}>{entry.userName}</p>
                      <p style={{ fontSize: '11px', color: '#8B7355' }}>{entry.userEmail}</p>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: op.bg, color: op.text, border: `1px solid ${op.border}` }}>
                        <OpIcon size={11} /> {entry.operation}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 500, color: '#0B1B3D' }}>{entry.moaCompany}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B7355' }}>{entry.moaHteId}</td>
                    <td>
                      {entry.changes && Object.keys(entry.changes).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '280px' }}>
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '5px', background: '#FDFAF6', border: '1px solid #EDE5D8' }}>
                              <span style={{ fontWeight: 600, color: '#0B1B3D', textTransform: 'capitalize' }}>{field}: </span>
                              <span style={{ color: '#DC2626', textDecoration: 'line-through' }}>{String(change.before).slice(0, 25)}</span>
                              <span style={{ color: '#8B7355', margin: '0 4px' }}>→</span>
                              <span style={{ color: '#16A34A' }}>{String(change.after).slice(0, 25)}</span>
                            </div>
                          ))}
                        </div>
                      ) : <span style={{ fontSize: '11px', color: '#C4B5A0', fontStyle: 'italic' }}>No field changes</span>}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid #F0EAE0', background: '#FDFAF6' }}>
          <span style={{ fontSize: '12px', color: '#8B7355' }}>Showing <strong>{filtered.length}</strong> of <strong>{allAudits.length}</strong> audit entries</span>
        </div>
      </div>
    </div>
  );
};