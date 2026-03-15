// src/pages/UserManagementPage.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Search, UserCheck, UserX } from "lucide-react";
import type { AppUser, UserRole } from "../types/MOA";
import {
  getUsers,
  toggleUserBlock,
  toggleFacultyMaintain,
  updateUserRole,
} from "../services/moaService";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    return (
      !q ||
      u.displayName?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const handleBlock = async (user: AppUser) => {
    if (user.uid === currentUser?.uid) {
      toast.error("You cannot block yourself.");
      return;
    }
    await toggleUserBlock(user.uid, !user.isBlocked);
    toast.success(user.isBlocked ? "User unblocked" : "User blocked");
    load();
  };
  const handleMaintain = async (user: AppUser) => {
    await toggleFacultyMaintain(user.uid, !user.canMaintainMOA);
    toast.success(
      user.canMaintainMOA ? "MOA access revoked" : "MOA access granted",
    );
    load();
  };
  const handleRoleChange = async (user: AppUser, role: UserRole) => {
    if (user.uid === currentUser?.uid) {
      toast.error("You cannot change your own role.");
      return;
    }
    await updateUserRole(user.uid, role);
    toast.success(`Role updated to ${role}`);
    load();
  };

  const rolePill = (role: UserRole) => {
    const map = {
      admin: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
      faculty: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
      student: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
    };
    return map[role];
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    faculty: users.filter((u) => u.role === "faculty").length,
    students: users.filter((u) => u.role === "student").length,
    blocked: users.filter((u) => u.isBlocked).length,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
      }}
    >
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage roles, permissions, and system access
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
        }}
      >
        {[
          {
            label: "Total",
            value: stats.total,
            color: "#0B1B3D",
            bg: "#F0EAE0",
          },
          {
            label: "Admins",
            value: stats.admins,
            color: "#DC2626",
            bg: "#FEF2F2",
          },
          {
            label: "Faculty",
            value: stats.faculty,
            color: "#2563EB",
            bg: "#EFF6FF",
          },
          {
            label: "Students",
            value: stats.students,
            color: "#16A34A",
            bg: "#F0FDF4",
          },
          {
            label: "Blocked",
            value: stats.blocked,
            color: "#6B7280",
            bg: "#F9FAFB",
          },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: bg,
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color,
                fontFamily: "Syne, sans-serif",
                lineHeight: 1,
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#8B7355",
                marginTop: "4px",
                fontWeight: 500,
              }}
            >
              {label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div
        className="section-card"
        style={{ padding: "12px 14px", display: "flex", gap: "10px" }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={14}
            color="#8B7355"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="neu-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
          className="neu-input"
          style={{ width: "auto" }}
        >
          <option value="ALL">All Roles</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="section-card"
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table className="moa-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>MOA Access</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#8B7355",
                    }}
                  >
                    Loading users…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#8B7355",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              )}
              {filtered.map((user, i) => {
                const rp = rolePill(user.role);
                return (
                  <motion.tr
                    key={user.uid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ opacity: user.isBlocked ? 0.6 : 1 }}
                  >
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              border: "2px solid #EDE5D8",
                            }}
                            alt=""
                          />
                        ) : (
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              background: "#C9A84C",
                              color: "#0B1B3D",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {user.displayName?.[0] || "U"}
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#0B1B3D",
                              }}
                            >
                              {user.displayName}
                            </p>
                            {user.uid === currentUser?.uid && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#F5E9C8",
                                  color: "#6B4F1A",
                                  padding: "1px 6px",
                                  borderRadius: "99px",
                                  fontWeight: 600,
                                }}
                              >
                                you
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: "#8B7355" }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        disabled={user.uid === currentUser?.uid}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value as UserRole)
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: "7px",
                          border: `1px solid ${rp.border}`,
                          background: rp.bg,
                          color: rp.text,
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontSize: "11px",
                          fontWeight: 500,
                          border: "1px solid",
                          ...(user.isBlocked
                            ? {
                                background: "#FEF2F2",
                                color: "#DC2626",
                                borderColor: "#FECACA",
                              }
                            : {
                                background: "#F0FDF4",
                                color: "#16A34A",
                                borderColor: "#BBF7D0",
                              }),
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: user.isBlocked ? "#DC2626" : "#16A34A",
                          }}
                        />
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      {user.role === "faculty" ? (
                        <button
                          onClick={() => handleMaintain(user)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "7px",
                            border: "1px solid",
                            fontSize: "11px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s",
                            ...(user.canMaintainMOA
                              ? {
                                  background: "#F0FDF4",
                                  color: "#16A34A",
                                  borderColor: "#BBF7D0",
                                }
                              : {
                                  background: "#F9FAFB",
                                  color: "#6B7280",
                                  borderColor: "#E5E7EB",
                                }),
                          }}
                        >
                          {user.canMaintainMOA ? (
                            <CheckSquare size={12} />
                          ) : (
                            <Square size={12} />
                          )}
                          {user.canMaintainMOA ? "Granted" : "Revoked"}
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#C4B5A0" }}>
                          N/A
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "12px", color: "#8B7355" }}>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      {user.uid !== currentUser?.uid && (
                        <button
                          onClick={() => handleBlock(user)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 12px",
                            borderRadius: "7px",
                            border: "1px solid",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s",
                            ...(user.isBlocked
                              ? {
                                  background: "#F0FDF4",
                                  color: "#16A34A",
                                  borderColor: "#BBF7D0",
                                }
                              : {
                                  background: "#FEF2F2",
                                  color: "#DC2626",
                                  borderColor: "#FECACA",
                                }),
                          }}
                        >
                          {user.isBlocked ? (
                            <UserCheck size={13} />
                          ) : (
                            <UserX size={13} />
                          )}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid #F0EAE0",
            background: "#FDFAF6",
          }}
        >
          <span style={{ fontSize: "12px", color: "#8B7355" }}>
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{users.length}</strong> users
          </span>
        </div>
      </div>
    </div>
  );
};
