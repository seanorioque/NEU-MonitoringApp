// src/components/AuditTrailModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, Plus, Edit2, Trash2, RefreshCw } from "lucide-react";
import type { MOA } from "../types/MOA";
import type { AuditEntry } from "../types/Audit";

interface Props {
  moa: MOA;
  onClose: () => void;
}

const opIcon = (op: AuditEntry["operation"]) => {
  switch (op) {
    case "INSERT":
      return <Plus size={12} className="text-emerald-600" />;
    case "UPDATE":
      return <Edit2 size={12} className="text-blue-600" />;
    case "DELETE":
      return <Trash2 size={12} className="text-red-600" />;
    case "RESTORE":
      return <RefreshCw size={12} className="text-purple-600" />;
  }
};

const opColor = (op: AuditEntry["operation"]) => {
  switch (op) {
    case "INSERT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "UPDATE":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "DELETE":
      return "bg-red-50 text-red-700 border-red-200";
    case "RESTORE":
      return "bg-purple-50 text-purple-700 border-purple-200";
  }
};

export const AuditTrailModal: React.FC<Props> = ({ moa, onClose }) => {
  const sorted = [...moa.auditTrail].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <AnimatePresence>
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div
            className="px-6 py-4 border-b border-neu-gold-pale flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 100%)",
            }}
          >
            <div className="flex items-center gap-2">
              <History size={16} style={{ color: "#C9A84C" }} />
              <h2 className="font-syne font-bold text-white">Audit Trail</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-neu-gold-pale bg-neu-cream/50">
            <p className="text-xs text-neu-slate">
              MOA: <strong className="text-neu-navy">{moa.companyName}</strong>
            </p>
            <p className="text-xs text-neu-slate">HTE ID: {moa.hteId}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sorted.length === 0 && (
              <p className="text-center text-sm text-neu-slate py-8">
                No audit records found
              </p>
            )}
            {sorted.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-neu-gold-pale p-3 bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`gold-badge text-xs border ${opColor(entry.operation)}`}
                    >
                      {opIcon(entry.operation)}
                      {entry.operation}
                    </span>
                    <span className="text-xs font-medium text-neu-navy">
                      {entry.userName}
                    </span>
                  </div>
                  <span className="text-xs text-neu-slate whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-neu-slate">{entry.userEmail}</p>
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(entry.changes).map(([field, change]) => (
                      <div
                        key={field}
                        className="text-xs p-1.5 rounded-lg bg-neu-cream"
                      >
                        <span className="font-medium text-neu-navy capitalize">
                          {field}
                        </span>
                        <span className="text-red-500 ml-2">
                          "{String(change.before)}"
                        </span>
                        <span className="text-neu-slate mx-1">→</span>
                        <span className="text-emerald-600">
                          "{String(change.after)}"
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
