// src/pages/MOAListPage.tsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  History,
  ChevronUp,
  ChevronDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  type MOA,
  type AppUser,
  COLLEGES,
  INDUSTRY_TYPES,
  ALL_STATUSES,
  getStatusGroup,
} from "../types/Index";
import { StatusBadge } from "../components/StatusBadge";
import { MOAFormModal } from "../components/MOAFormModal";
import { AuditTrailModal } from "../components/AuditTrailModal";
import {
  addMOA,
  updateMOA,
  softDeleteMOA,
  restoreMOA,
} from "../services/moaService";
import toast from "react-hot-toast";

interface Props {
  moas: MOA[];
  currentUser: AppUser;
  onRefresh: () => void;
}
type SortKey =
  | "companyName"
  | "effectiveDate"
  | "expirationDate"
  | "status"
  | "endorsedByCollege";
const canMaintain = (u: AppUser) =>
  u.role === "admin" || (u.role === "faculty" && u.canMaintainMOA);

export const MOAListPage: React.FC<Props> = ({
  moas,
  currentUser,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("companyName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showForm, setShowForm] = useState(false);
  const [editMOA, setEditMOA] = useState<MOA | null>(null);
  const [auditMOA, setAuditMOA] = useState<MOA | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const role = currentUser.role;

  const visibleMOAs = useMemo(
    () =>
      moas.filter((m) => {
        if (role === "admin") return true;
        if (m.isDeleted) return false;
        if (role === "student") return getStatusGroup(m.status) === "APPROVED";
        return true;
      }),
    [moas, role],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return visibleMOAs.filter((m) => {
      if (!showDeleted && m.isDeleted) return false;
      if (collegeFilter !== "ALL" && m.endorsedByCollege !== collegeFilter)
        return false;
      if (industryFilter !== "ALL" && m.industryType !== industryFilter)
        return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (!q) return true;
      return [
        m.companyName,
        m.address,
        m.contactPerson,
        m.contactEmail,
        m.endorsedByCollege,
        m.industryType,
        m.hteId,
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [
    visibleMOAs,
    search,
    collegeFilter,
    industryFilter,
    statusFilter,
    showDeleted,
  ]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        let av: string | number = "",
          bv: string | number = "";
        if (sortKey === "companyName") {
          av = a.companyName;
          bv = b.companyName;
        } else if (sortKey === "status") {
          av = a.status;
          bv = b.status;
        } else if (sortKey === "endorsedByCollege") {
          av = a.endorsedByCollege;
          bv = b.endorsedByCollege;
        } else if (sortKey === "effectiveDate") {
          av = a.effectiveDate.getTime();
          bv = b.effectiveDate.getTime();
        } else if (sortKey === "expirationDate") {
          av = a.expirationDate.getTime();
          bv = b.expirationDate.getTime();
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      }),
    [filtered, sortKey, sortDir],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "3px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        font: "inherit",
        padding: 0,
      }}
    >
      {label}
      {sortKey === k ? (
        sortDir === "asc" ? (
          <ChevronUp size={11} />
        ) : (
          <ChevronDown size={11} />
        )
      ) : (
        <ChevronUp size={11} style={{ opacity: 0.3 }} />
      )}
    </button>
  );

  const handleAdd = async (data: Parameters<typeof addMOA>[0]) => {
    await addMOA(data, currentUser);
    toast.success("MOA added");
    onRefresh();
  };
  const handleEdit = async (data: Parameters<typeof addMOA>[0]) => {
    if (!editMOA) return;
    await updateMOA(editMOA.id, data, currentUser, editMOA);
    toast.success("MOA updated");
    onRefresh();
  };
  const handleDelete = async (moa: MOA) => {
    if (!confirm(`Soft-delete "${moa.companyName}"?`)) return;
    await softDeleteMOA(moa.id, currentUser);
    toast.success("MOA deleted (recoverable)");
    onRefresh();
  };
  const handleRestore = async (moa: MOA) => {
    await restoreMOA(moa.id, currentUser);
    toast.success("MOA restored");
    onRefresh();
  };

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const activeFilters =
    [collegeFilter, industryFilter, statusFilter].filter((f) => f !== "ALL")
      .length + (showDeleted ? 1 : 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
      }}
    >
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            {role === "student"
              ? "Active MOAs"
              : role === "admin"
                ? "All MOA Records"
                : "MOA List"}
          </h1>
          <p className="page-subtitle">
            {sorted.length} record{sorted.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {canMaintain(currentUser) && (
          <button
            onClick={() => {
              setEditMOA(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus size={14} /> Add New MOA
          </button>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="section-card">
        <div
          style={{
            padding: "12px 14px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            borderBottom: showFilters ? "1px solid #F0EAE0" : "none",
          }}
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
              placeholder="Search company, contact, address, industry, college, HTE ID…"
              className="neu-input"
              style={{
                paddingLeft: "36px",
                paddingRight: search ? "36px" : "14px",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8B7355",
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 14px",
              borderRadius: "10px",
              border:
                activeFilters > 0
                  ? "1.5px solid #C9A84C"
                  : "1.5px solid #E8DCC8",
              background: activeFilters > 0 ? "rgba(201,168,76,0.08)" : "white",
              color: activeFilters > 0 ? "#C9A84C" : "#6B5E4E",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.18s",
              fontFamily: "inherit",
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilters > 0 && (
              <span
                style={{
                  background: "#C9A84C",
                  color: "#0B1B3D",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  background: "#FDFAF6",
                  alignItems: "center",
                }}
              >
                <select
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  className="neu-input"
                  style={{ width: "auto" }}
                >
                  <option value="ALL">All Colleges</option>
                  {COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="neu-input"
                  style={{ width: "auto" }}
                >
                  <option value="ALL">All Industries</option>
                  {INDUSTRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {role !== "student" && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="neu-input"
                    style={{ width: "auto", minWidth: "220px" }}
                  >
                    <option value="ALL">All Statuses</option>
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
                {role === "admin" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid #E8DCC8",
                      background: "white",
                      fontSize: "13px",
                      color: "#2D2416",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showDeleted}
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      style={{ accentColor: "#C9A84C" }}
                    />
                    Show deleted rows
                  </label>
                )}
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setCollegeFilter("ALL");
                      setIndustryFilter("ALL");
                      setStatusFilter("ALL");
                      setShowDeleted(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      border: "1px solid #EDE5D8",
                      background: "white",
                      color: "#8B7355",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
          <table className="moa-table">
            <thead>
              <tr>
                {role !== "student" && (
                  <th style={{ width: "100px" }}>HTE ID</th>
                )}
                <th>
                  <SortBtn k="companyName" label="Company" />
                </th>
                <th>Address</th>
                <th>Contact Person</th>
                <th>Email</th>
                {role !== "student" && <th>Industry</th>}
                {role !== "student" && (
                  <th>
                    <SortBtn k="effectiveDate" label="Effective" />
                  </th>
                )}
                {role !== "student" && (
                  <th>
                    <SortBtn k="expirationDate" label="Expires" />
                  </th>
                )}
                <th>
                  <SortBtn k="status" label="Status" />
                </th>
                {role !== "student" && (
                  <th>
                    <SortBtn k="endorsedByCollege" label="College" />
                  </th>
                )}
                {(canMaintain(currentUser) || role === "admin") && (
                  <th style={{ width: "100px" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={20}
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      color: "#8B7355",
                      fontSize: "13px",
                    }}
                  >
                    No MOA records found
                  </td>
                </tr>
              )}
              {sorted.map((moa, i) => (
                <motion.tr
                  key={moa.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.025, 0.3) }}
                  style={{
                    opacity: moa.isDeleted ? 0.5 : 1,
                    background: moa.isDeleted ? "#FEF2F2" : "transparent",
                  }}
                >
                  {role !== "student" && (
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "#8B7355",
                      }}
                    >
                      {moa.hteId}
                    </td>
                  )}
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#0B1B3D",
                        fontSize: "13px",
                      }}
                    >
                      {moa.companyName}
                    </div>
                    {moa.isDeleted && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#EF4444",
                          fontWeight: 600,
                        }}
                      >
                        DELETED
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      fontSize: "12px",
                      color: "#6B5E4E",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {moa.address}
                  </td>
                  <td
                    style={{
                      fontSize: "13px",
                      color: "#2D2416",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {moa.contactPerson}
                  </td>
                  <td>
                    <a
                      href={`mailto:${moa.contactEmail}`}
                      style={{
                        fontSize: "12px",
                        color: "#1A3A6C",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#C9A84C")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#1A3A6C")
                      }
                    >
                      {moa.contactEmail}
                    </a>
                  </td>
                  {role !== "student" && (
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "99px",
                          background: "#F5E9C8",
                          color: "#6B4F1A",
                          fontSize: "11px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {moa.industryType}
                      </span>
                    </td>
                  )}
                  {role !== "student" && (
                    <td
                      style={{
                        fontSize: "12px",
                        color: "#6B5E4E",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtDate(moa.effectiveDate)}
                    </td>
                  )}
                  {role !== "student" && (
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight:
                            getStatusGroup(moa.status) === "EXPIRING"
                              ? 600
                              : 400,
                          color:
                            getStatusGroup(moa.status) === "EXPIRING"
                              ? "#EA580C"
                              : getStatusGroup(moa.status) === "EXPIRED"
                                ? "#DC2626"
                                : "#6B5E4E",
                        }}
                      >
                        {fmtDate(moa.expirationDate)}
                      </span>
                    </td>
                  )}
                  <td>
                    <StatusBadge status={moa.status} small />
                  </td>
                  {role !== "student" && (
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "rgba(11,27,61,0.06)",
                          color: "#0B1B3D",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {moa.endorsedByCollege}
                      </span>
                    </td>
                  )}
                  {(canMaintain(currentUser) || role === "admin") && (
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {canMaintain(currentUser) && !moa.isDeleted && (
                          <>
                            <button
                              onClick={() => {
                                setEditMOA(moa);
                                setShowForm(true);
                              }}
                              style={{
                                padding: "5px",
                                borderRadius: "7px",
                                border: "1px solid #DBEAFE",
                                background: "#EFF6FF",
                                color: "#2563EB",
                                cursor: "pointer",
                                display: "flex",
                                transition: "all 0.15s",
                              }}
                              title="Edit"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2563EB";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#EFF6FF";
                                e.currentTarget.style.color = "#2563EB";
                              }}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(moa)}
                              style={{
                                padding: "5px",
                                borderRadius: "7px",
                                border: "1px solid #FECACA",
                                background: "#FEF2F2",
                                color: "#DC2626",
                                cursor: "pointer",
                                display: "flex",
                                transition: "all 0.15s",
                              }}
                              title="Delete"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#DC2626";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#FEF2F2";
                                e.currentTarget.style.color = "#DC2626";
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                        {role === "admin" && moa.isDeleted && (
                          <button
                            onClick={() => handleRestore(moa)}
                            style={{
                              padding: "5px",
                              borderRadius: "7px",
                              border: "1px solid #BBF7D0",
                              background: "#F0FDF4",
                              color: "#16A34A",
                              cursor: "pointer",
                              display: "flex",
                              transition: "all 0.15s",
                            }}
                            title="Restore"
                          >
                            <RefreshCw size={12} />
                          </button>
                        )}
                        {role === "admin" && (
                          <button
                            onClick={() => setAuditMOA(moa)}
                            style={{
                              padding: "5px",
                              borderRadius: "7px",
                              border: "1px solid #FDE68A",
                              background: "#FFFBEB",
                              color: "#D97706",
                              cursor: "pointer",
                              display: "flex",
                              transition: "all 0.15s",
                            }}
                            title="Audit Trail"
                          >
                            <History size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid #F0EAE0",
            background: "#FDFAF6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "12px", color: "#8B7355" }}>
            Showing <strong>{sorted.length}</strong> of{" "}
            <strong>{visibleMOAs.length}</strong> records
          </span>
          {search && (
            <span style={{ fontSize: "12px", color: "#C9A84C" }}>
              Filtered by: "{search}"
            </span>
          )}
        </div>
      </div>

      {showForm && (
        <MOAFormModal
          moa={editMOA}
          onClose={() => {
            setShowForm(false);
            setEditMOA(null);
          }}
          onSave={editMOA ? handleEdit : handleAdd}
        />
      )}
      {auditMOA && (
        <AuditTrailModal moa={auditMOA} onClose={() => setAuditMOA(null)} />
      )}
    </div>
  );
};
