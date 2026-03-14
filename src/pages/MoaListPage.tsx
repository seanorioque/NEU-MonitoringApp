// src/pages/MOAListPage.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, RefreshCw, History,
  ChevronUp, ChevronDown, Filter, X
} from 'lucide-react';
import { type MOA, type AppUser, COLLEGES, INDUSTRY_TYPES, ALL_STATUSES, getStatusGroup } from '../types/Index';
import { StatusBadge } from '../components/StatusBadge';
import { MOAFormModal } from '../components/MOAFormModal';
import { AuditTrailModal } from '../components/AuditTrailModal';
import { addMOA, updateMOA, softDeleteMOA, restoreMOA } from '../services/moaService';
import toast from 'react-hot-toast';

interface Props {
  moas: MOA[];
  currentUser: AppUser;
  onRefresh: () => void;
}

type SortKey = 'companyName' | 'effectiveDate' | 'expirationDate' | 'status' | 'endorsedByCollege';

const canMaintain = (user: AppUser) =>
  user.role === 'admin' || (user.role === 'faculty' && user.canMaintainMOA);

export const MOAListPage: React.FC<Props> = ({ moas, currentUser, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('companyName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editMOA, setEditMOA] = useState<MOA | null>(null);
  const [auditMOA, setAuditMOA] = useState<MOA | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const role = currentUser.role;

  // Role-based row visibility
  const visibleMOAs = useMemo(() => {
    return moas.filter(m => {
      if (role === 'admin') return true; // admin sees all including deleted
      if (m.isDeleted) return false;
      if (role === 'student') return getStatusGroup(m.status) === 'APPROVED';
      return true; // faculty sees all non-deleted
    });
  }, [moas, role]);

  // Search + filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return visibleMOAs.filter(m => {
      if (!showDeleted && m.isDeleted) return false;
      if (collegeFilter !== 'ALL' && m.endorsedByCollege !== collegeFilter) return false;
      if (industryFilter !== 'ALL' && m.industryType !== industryFilter) return false;
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.companyName.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.contactPerson.toLowerCase().includes(q) ||
        m.contactEmail.toLowerCase().includes(q) ||
        m.endorsedByCollege.toLowerCase().includes(q) ||
        m.industryType.toLowerCase().includes(q) ||
        m.hteId.toLowerCase().includes(q)
      );
    });
  }, [visibleMOAs, search, collegeFilter, industryFilter, statusFilter, showDeleted]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'companyName') { av = a.companyName; bv = b.companyName; }
      else if (sortKey === 'status') { av = a.status; bv = b.status; }
      else if (sortKey === 'endorsedByCollege') { av = a.endorsedByCollege; bv = b.endorsedByCollege; }
      else if (sortKey === 'effectiveDate') { av = a.effectiveDate.getTime(); bv = b.effectiveDate.getTime(); }
      else if (sortKey === 'expirationDate') { av = a.expirationDate.getTime(); bv = b.expirationDate.getTime(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
      : <ChevronUp size={12} className="opacity-30" />
  );

  const handleAdd = async (data: Parameters<typeof addMOA>[0]) => {
    await addMOA(data, currentUser);
    toast.success('MOA added successfully');
    onRefresh();
  };

  const handleEdit = async (data: Parameters<typeof addMOA>[0]) => {
    if (!editMOA) return;
    await updateMOA(editMOA.id, data, currentUser, editMOA);
    toast.success('MOA updated successfully');
    onRefresh();
  };

  const handleDelete = async (moa: MOA) => {
    if (!window.confirm(`Soft-delete MOA for "${moa.companyName}"? It can be restored later.`)) return;
    await softDeleteMOA(moa.id, currentUser);
    toast.success('MOA deleted (soft delete)');
    onRefresh();
  };

  const handleRestore = async (moa: MOA) => {
    await restoreMOA(moa.id, currentUser);
    toast.success('MOA restored successfully');
    onRefresh();
  };

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const activeFilters = [collegeFilter, industryFilter, statusFilter].filter(f => f !== 'ALL').length
    + (showDeleted ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-syne font-bold text-neu-navy">
            {role === 'student' ? 'Active MOAs' : role === 'admin' ? 'All MOA Records' : 'MOA List'}
          </h2>
          <p className="text-sm text-neu-slate mt-0.5">{sorted.length} record{sorted.length !== 1 ? 's' : ''} found</p>
        </div>
        {canMaintain(currentUser) && (
          <button onClick={() => { setEditMOA(null); setShowForm(true); }} className="btn-primary">
            <Plus size={15} /> Add MOA
          </button>
        )}
      </div>

      {/* Search + Filters bar */}
      <div className="bg-white rounded-2xl border border-neu-gold-pale shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-neu-gold-pale">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neu-slate" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company, address, contact, industry, college…"
              className="neu-input pl-9 pr-4"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neu-slate hover:text-neu-navy">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              activeFilters > 0 ? 'border-neu-gold bg-neu-gold/10 text-neu-gold' : 'border-neu-gold-pale text-neu-slate hover:border-neu-gold'
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: '#C9A84C', color: '#0B1B3D' }}>{activeFilters}</span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 flex flex-wrap gap-3 bg-neu-cream/50">
                <select value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)}
                  className="neu-input w-auto">
                  <option value="ALL">All Colleges</option>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                  className="neu-input w-auto">
                  <option value="ALL">All Industries</option>
                  {INDUSTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {role !== 'student' && (
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="neu-input w-auto min-w-48">
                    <option value="ALL">All Statuses</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {role === 'admin' && (
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl border border-neu-gold-pale bg-white text-sm text-neu-navy">
                    <input type="checkbox" checked={showDeleted}
                      onChange={e => setShowDeleted(e.target.checked)}
                      className="rounded accent-neu-gold" />
                    Show deleted
                  </label>
                )}
                {activeFilters > 0 && (
                  <button onClick={() => { setCollegeFilter('ALL'); setIndustryFilter('ALL'); setStatusFilter('ALL'); setShowDeleted(false); }}
                    className="text-xs text-neu-gold underline self-center">
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neu-gold-pale shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="moa-table">
            <thead>
              <tr>
                {role !== 'student' && <th>HTE ID</th>}
                <th>
                  <button onClick={() => toggleSort('companyName')} className="flex items-center gap-1 hover:text-neu-gold-light">
                    Company <SortIcon k="companyName" />
                  </button>
                </th>
                <th>Address</th>
                <th>Contact Person</th>
                <th>Email</th>
                {role !== 'student' && <th>Industry</th>}
                {role !== 'student' && (
                  <th>
                    <button onClick={() => toggleSort('effectiveDate')} className="flex items-center gap-1 hover:text-neu-gold-light">
                      Effective <SortIcon k="effectiveDate" />
                    </button>
                  </th>
                )}
                {role !== 'student' && (
                  <th>
                    <button onClick={() => toggleSort('expirationDate')} className="flex items-center gap-1 hover:text-neu-gold-light">
                      Expires <SortIcon k="expirationDate" />
                    </button>
                  </th>
                )}
                <th>
                  <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-neu-gold-light">
                    Status <SortIcon k="status" />
                  </button>
                </th>
                {role !== 'student' && (
                  <th>
                    <button onClick={() => toggleSort('endorsedByCollege')} className="flex items-center gap-1 hover:text-neu-gold-light">
                      College <SortIcon k="endorsedByCollege" />
                    </button>
                  </th>
                )}
                {(canMaintain(currentUser) || role === 'admin') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={20} className="text-center py-12 text-neu-slate text-sm">
                      No MOA records found
                    </td>
                  </tr>
                )}
                {sorted.map((moa, i) => (
                  <motion.tr
                    key={moa.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={moa.isDeleted ? 'opacity-50 bg-red-50/50' : ''}
                  >
                    {role !== 'student' && (
                      <td className="font-mono text-xs text-neu-slate">{moa.hteId}</td>
                    )}
                    <td>
                      <div className="font-medium text-neu-navy text-sm">{moa.companyName}</div>
                      {moa.isDeleted && (
                        <span className="text-xs text-red-500 font-medium">[DELETED]</span>
                      )}
                    </td>
                    <td className="text-xs text-neu-slate max-w-xs truncate">{moa.address}</td>
                    <td className="text-sm text-neu-navy">{moa.contactPerson}</td>
                    <td className="text-xs">
                      <a href={`mailto:${moa.contactEmail}`} className="text-neu-blue hover:text-neu-gold transition-colors">
                        {moa.contactEmail}
                      </a>
                    </td>
                    {role !== 'student' && (
                      <td>
                        <span className="px-2 py-1 rounded-full text-xs bg-neu-gold-pale text-neu-navy font-medium">
                          {moa.industryType}
                        </span>
                      </td>
                    )}
                    {role !== 'student' && <td className="text-xs text-neu-slate">{fmtDate(moa.effectiveDate)}</td>}
                    {role !== 'student' && (
                      <td className="text-xs">
                        <span className={
                          getStatusGroup(moa.status) === 'EXPIRING' ? 'text-orange-600 font-medium' :
                          getStatusGroup(moa.status) === 'EXPIRED' ? 'text-red-600' : 'text-neu-slate'
                        }>
                          {fmtDate(moa.expirationDate)}
                        </span>
                      </td>
                    )}
                    <td>
                      <StatusBadge status={moa.status} small />
                    </td>
                    {role !== 'student' && (
                      <td>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-neu-navy/5 text-neu-navy">
                          {moa.endorsedByCollege}
                        </span>
                      </td>
                    )}
                    {(canMaintain(currentUser) || role === 'admin') && (
                      <td>
                        <div className="flex items-center gap-1">
                          {canMaintain(currentUser) && !moa.isDeleted && (
                            <>
                              <button
                                onClick={() => { setEditMOA(moa); setShowForm(true); }}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(moa)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                          {role === 'admin' && moa.isDeleted && (
                            <button
                              onClick={() => handleRestore(moa)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                              title="Restore"
                            >
                              <RefreshCw size={13} />
                            </button>
                          )}
                          {role === 'admin' && (
                            <button
                              onClick={() => setAuditMOA(moa)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                              title="View Audit Trail"
                            >
                              <History size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <MOAFormModal
          moa={editMOA}
          onClose={() => { setShowForm(false); setEditMOA(null); }}
          onSave={editMOA ? handleEdit : handleAdd}
        />
      )}
      {auditMOA && (
        <AuditTrailModal moa={auditMOA} onClose={() => setAuditMOA(null)} />
      )}
    </div>
  );
};