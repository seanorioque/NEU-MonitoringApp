// src/components/MOAFormModal.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Building2,
  User,
  Mail,
  MapPin,
  Tag,
  Calendar,
  FileText,
  GraduationCap,
  Hash,
} from "lucide-react";
import { type MOA, ALL_STATUSES } from "../types/MOA";
import { INDUSTRY_TYPES } from "../types/IndustryTypes";
import { COLLEGES } from "../types/Colleges";

interface Props {
  moa?: MOA | null;
  onClose: () => void;
  onSave: (
    data: Omit<
      MOA,
      "id" | "createdAt" | "updatedAt" | "auditTrail" | "isDeleted"
    >,
  ) => Promise<void>;
}

const fmt = (d: Date) => d.toISOString().split("T")[0];

const STATUS_GROUPS = {
  APPROVED: ALL_STATUSES.filter((s) => s.startsWith("APPROVED")),
  PROCESSING: ALL_STATUSES.filter((s) => s.startsWith("PROCESSING")),
  "EXPIRING / EXPIRED": ALL_STATUSES.filter((s) => s.startsWith("EXPIR")),
};

// ── Extracted outside component to prevent remount on every keystroke ──

interface FieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  span?: boolean;
}

const FormField: React.FC<FieldProps> = ({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder = "",
  span,
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "#FCA5A5" : focused ? "#C9A84C" : "#E8DCC8";
  const shadow = focused
    ? `0 0 0 3px ${error ? "rgba(239,68,68,0.1)" : "rgba(201,168,76,0.12)"}`
    : "none";

  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <label
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#6B5E4E",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </label>
        {error && (
          <span style={{ fontSize: "11px", color: "#EF4444", fontWeight: 500 }}>
            {error}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <Icon
          size={14}
          color={error ? "#EF4444" : focused ? "#C9A84C" : "#B8A898"}
          style={{
            position: "absolute",
            left: "11px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "9px 12px 9px 36px",
            borderRadius: "10px",
            border: `1.5px solid ${borderColor}`,
            background: error ? "#FFF5F5" : "#fff",
            color: "#0B1B3D",
            fontSize: "13px",
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: shadow,
          }}
        />
      </div>
    </div>
  );
};

interface SelectProps {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  span?: boolean;
}

const FormSelect: React.FC<SelectProps> = ({
  icon: Icon,
  label,
  value,
  onChange,
  children,
  span,
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? "#C9A84C" : "#E8DCC8";
  const shadow = focused ? "0 0 0 3px rgba(201,168,76,0.12)" : "none";

  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 600,
          color: "#6B5E4E",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "5px",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          size={14}
          color={focused ? "#C9A84C" : "#B8A898"}
          style={{
            position: "absolute",
            left: "11px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "9px 36px 9px 36px",
            borderRadius: "10px",
            border: `1.5px solid ${borderColor}`,
            background: "#fff",
            color: "#0B1B3D",
            fontSize: "13px",
            fontFamily: "inherit",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: shadow,
          }}
        >
          {children}
        </select>
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M2 4l4 4 4-4"
              stroke="#8B7355"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ElementType; label: string }> = ({
  icon: Icon,
  label,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      marginBottom: "14px",
      paddingBottom: "8px",
      borderBottom: "1px solid #F0EAE0",
    }}
  >
    <Icon size={13} color="#C9A84C" />
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#8B7355",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {label}
    </span>
  </div>
);

// ── Main modal component ──────────────────────────────────────────────────────

export const MOAFormModal: React.FC<Props> = ({ moa, onClose, onSave }) => {
  const [form, setForm] = useState({
    hteId: "",
    companyName: "",
    address: "",
    contactPerson: "",
    contactEmail: "",
    industryType: INDUSTRY_TYPES[0],
    effectiveDate: fmt(new Date()),
    expirationDate: fmt(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    status: ALL_STATUSES[0],
    endorsedByCollege: COLLEGES[0],
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (moa) {
      setForm({
        hteId: moa.hteId,
        companyName: moa.companyName,
        address: moa.address,
        contactPerson: moa.contactPerson,
        contactEmail: moa.contactEmail,
        industryType: moa.industryType,
        effectiveDate: fmt(moa.effectiveDate),
        expirationDate: fmt(moa.expirationDate),
        status: moa.status,
        endorsedByCollege: moa.endorsedByCollege,
      });
    }
  }, [moa]);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.hteId.trim()) e.hteId = "Required";
    if (!form.companyName.trim()) e.companyName = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.contactPerson.trim()) e.contactPerson = "Required";
    if (!form.contactEmail.trim()) e.contactEmail = "Required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.contactEmail))
      e.contactEmail = "Invalid email";
    if (new Date(form.expirationDate) <= new Date(form.effectiveDate))
      e.expirationDate = "Must be after effective date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        effectiveDate: new Date(form.effectiveDate),
        expirationDate: new Date(form.expirationDate),
      } as Parameters<typeof onSave>[0]);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const statusDotColor = form.status.startsWith("APPROVED")
    ? "#10B981"
    : form.status.startsWith("PROCESSING")
      ? "#F59E0B"
      : form.status.startsWith("EXPIRING")
        ? "#F97316"
        : "#EF4444";

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(11,27,61,0.6)",
          backdropFilter: "blur(6px)",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            background: "#fff",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "92vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 32px 80px rgba(11,27,61,0.25)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 100%)",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "linear-gradient(135deg, #C9A84C, #E8C96E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={16} color="#0B1B3D" />
              </div>
              <div>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "Syne, sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {moa ? "Edit MOA Entry" : "Add New MOA Entry"}
                </h2>
                <p
                  style={{
                    color: "rgba(201,168,76,0.7)",
                    fontSize: "11px",
                    marginTop: "3px",
                  }}
                >
                  {moa
                    ? `Editing: ${moa.companyName}`
                    : "Fill in all required fields"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Error banner */}
          {Object.keys(errors).length > 0 && (
            <div
              style={{
                padding: "10px 24px",
                background: "#FEF2F2",
                borderBottom: "1px solid #FECACA",
              }}
            >
              <span
                style={{ fontSize: "12px", color: "#DC2626", fontWeight: 500 }}
              >
                ⚠ Please fix the errors below before saving.
              </span>
            </div>
          )}

          {/* Form body */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Company Info */}
            <div>
              <SectionHeader icon={Building2} label="Company Information" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <FormField
                  icon={Hash}
                  label="HTE ID *"
                  value={form.hteId}
                  onChange={set("hteId")}
                  error={errors.hteId}
                  placeholder="e.g. HTE-2024-001"
                />
                <FormField
                  icon={Building2}
                  label="Company Name *"
                  value={form.companyName}
                  onChange={set("companyName")}
                  error={errors.companyName}
                  placeholder="Enter company name"
                />
                <FormField
                  icon={MapPin}
                  label="Address *"
                  value={form.address}
                  onChange={set("address")}
                  error={errors.address}
                  placeholder="Full company address"
                  span
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <SectionHeader icon={User} label="Contact Details" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <FormField
                  icon={User}
                  label="Contact Person *"
                  value={form.contactPerson}
                  onChange={set("contactPerson")}
                  error={errors.contactPerson}
                  placeholder="Full name"
                />
                <FormField
                  icon={Mail}
                  label="Contact Email *"
                  value={form.contactEmail}
                  onChange={set("contactEmail")}
                  error={errors.contactEmail}
                  type="email"
                  placeholder="email@company.com"
                />
              </div>
            </div>

            {/* Classification */}
            <div>
              <SectionHeader icon={Tag} label="Classification" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <FormSelect
                  icon={Tag}
                  label="Industry Type"
                  value={form.industryType}
                  onChange={
                    set("industryType") as (
                      e: React.ChangeEvent<HTMLSelectElement>,
                    ) => void
                  }
                >
                  {INDUSTRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </FormSelect>
                <FormSelect
                  icon={GraduationCap}
                  label="Endorsed by College"
                  value={form.endorsedByCollege}
                  onChange={
                    set("endorsedByCollege") as (
                      e: React.ChangeEvent<HTMLSelectElement>,
                    ) => void
                  }
                >
                  {COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>

            {/* MOA Terms */}
            <div>
              <SectionHeader icon={Calendar} label="MOA Terms & Status" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <FormField
                  icon={Calendar}
                  label="Effective Date *"
                  value={form.effectiveDate}
                  onChange={set("effectiveDate")}
                  type="date"
                />
                <FormField
                  icon={Calendar}
                  label="Expiration Date *"
                  value={form.expirationDate}
                  onChange={set("expirationDate")}
                  error={errors.expirationDate}
                  type="date"
                />

                {/* Status select */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#6B5E4E",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "5px",
                    }}
                  >
                    MOA Status
                  </label>
                  <div style={{ position: "relative" }}>
                    <FileText
                      size={14}
                      color="#B8A898"
                      style={{
                        position: "absolute",
                        left: "11px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        zIndex: 1,
                      }}
                    />
                    <select
                      value={form.status}
                      onChange={
                        set("status") as (
                          e: React.ChangeEvent<HTMLSelectElement>,
                        ) => void
                      }
                      style={{
                        width: "100%",
                        padding: "9px 36px 9px 36px",
                        borderRadius: "10px",
                        border: "1.5px solid #E8DCC8",
                        background: "#fff",
                        color: "#0B1B3D",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none",
                      }}
                    >
                      {Object.entries(STATUS_GROUPS).map(
                        ([group, statuses]) => (
                          <optgroup key={group} label={`── ${group} ──`}>
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </optgroup>
                        ),
                      )}
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path
                          d="M2 4l4 4 4-4"
                          stroke="#8B7355"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Live preview */}
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "#F8F6F1",
                      border: "1px solid #EDE5D8",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: statusDotColor,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#0B1B3D",
                        fontWeight: 500,
                      }}
                    >
                      {form.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid #EDE5D8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#FDFAF6",
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: "11px", color: "#8B7355" }}>
              {moa
                ? "Changes will be logged to the audit trail"
                : "All * fields are required"}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "1.5px solid #E8DCC8",
                  background: "white",
                  color: "#6B5E4E",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: saving
                    ? "#E8DCC8"
                    : "linear-gradient(135deg, #C9A84C, #E8C96E)",
                  color: "#0B1B3D",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: saving ? "none" : "0 2px 8px rgba(201,168,76,0.3)",
                }}
              >
                {saving ? (
                  <>
                    <div
                      style={{
                        width: "13px",
                        height: "13px",
                        borderRadius: "50%",
                        border: "2px solid rgba(0,0,0,0.2)",
                        borderTopColor: "#6B4F1A",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {moa ? "Save Changes" : "Add MOA"}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AnimatePresence>
  );
};
