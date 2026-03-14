// src/pages/UserManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square, Search, UserCheck, UserX } from 'lucide-react';
import type { AppUser, UserRole } from '../types/Index';
import { getUsers, toggleUserBlock, toggleFacultyMaintain, updateUserRole } from '../services/moaService';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return !q || u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleBlock = async (user: AppUser) => {
    if (user.uid === currentUser?.uid) { toast.error("You cannot block yourself."); return; }
    await toggleUserBlock(user.uid, !user.isBlocked);
    toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
    load();
  };

  const handleMaintain = async (user: AppUser) => {
    await toggleFacultyMaintain(user.uid, !user.canMaintainMOA);
    toast.success(user.canMaintainMOA ? 'MOA maintenance access revoked' : 'MOA maintenance access granted');
    load();
  };

  const handleRoleChange = async (user: AppUser, role: UserRole) => {
    if (user.uid === currentUser?.uid) { toast.error("You cannot change your own role."); return; }
    await updateUserRole(user.uid, role);
    toast.success(`Role updated to ${role}`);
    load();
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    faculty: 'bg-blue-100 text-blue-700 border-blue-200',
    student: 'bg-green-100 text-green-700 border-green-200',
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    students: users.filter(u => u.role === 'student').length,
    blocked: users.filter(u => u.isBlocked).length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-syne font-bold text-neu-navy">User Management</h2>
        <p className="text-sm text-neu-slate mt-0.5">Manage roles, access, and system permissions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Users', value: stats.total, color: '#0B1B3D' },
          { label: 'Admins', value: stats.admins, color: '#DC2626' },
          { label: 'Faculty', value: stats.faculty, color: '#2563EB' },
          { label: 'Students', value: stats.students, color: '#16A34A' },
          { label: 'Blocked', value: stats.blocked, color: '#9CA3AF' },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-4 border border-neu-gold-pale shadow-sm text-center"
          >
            <p className="text-2xl font-syne font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-neu-slate mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-2xl border border-neu-gold-pale shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neu-slate" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="neu-input pl-9" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as UserRole | 'ALL')}
          className="neu-input w-auto">
          <option value="ALL">All Roles</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-neu-gold-pale shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="moa-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>MOA Maintain</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center py-10 text-neu-slate text-sm">Loading users…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-neu-slate text-sm">No users found</td></tr>
              )}
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.uid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={user.isBlocked ? 'opacity-50' : ''}
                >
                  <td>
                    <div className="flex items-center gap-2.5">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: '#C9A84C', color: '#0B1B3D' }}>
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neu-navy">{user.displayName}</p>
                        <p className="text-xs text-neu-slate">{user.email}</p>
                      </div>
                      {user.uid === currentUser?.uid && (
                        <span className="text-xs bg-neu-gold/20 text-neu-gold px-2 py-0.5 rounded-full">(you)</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      disabled={user.uid === currentUser?.uid}
                      onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer ${roleColors[user.role]} bg-transparent`}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {user.isBlocked ? (
                      <span className="gold-badge bg-red-50 text-red-700 border-red-200 border">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Blocked
                      </span>
                    ) : (
                      <span className="gold-badge bg-emerald-50 text-emerald-700 border-emerald-200 border">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    )}
                  </td>
                  <td>
                    {user.role === 'faculty' ? (
                      <button
                        onClick={() => handleMaintain(user)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                          user.canMaintainMOA
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {user.canMaintainMOA ? <CheckSquare size={13} /> : <Square size={13} />}
                        {user.canMaintainMOA ? 'Granted' : 'Revoked'}
                      </button>
                    ) : (
                      <span className="text-xs text-neu-slate italic">N/A</span>
                    )}
                  </td>
                  <td className="text-xs text-neu-slate">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    {user.uid !== currentUser?.uid && (
                      <button
                        onClick={() => handleBlock(user)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                          user.isBlocked
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {user.isBlocked ? <UserCheck size={13} /> : <UserX size={13} />}
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};