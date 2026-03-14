// src/components/MOAFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { type MOA, ALL_STATUSES, INDUSTRY_TYPES, COLLEGES } from '../types/index'

interface Props {
  moa?: MOA | null;
  onClose: () => void;
  onSave: (data: Omit<MOA, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'isDeleted'>) => Promise<void>;
}

const fmt = (d: Date) => d.toISOString().split('T')[0];

export const MOAFormModal: React.FC<Props> = ({ moa, onClose, onSave }) => {
  const [form, setForm] = useState({
    hteId: '',
    companyName: '',
    address: '',
    contactPerson: '',
    contactEmail: '',
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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.hteId.trim()) e.hteId = 'HTE ID is required';
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.contactPerson.trim()) e.contactPerson = 'Contact person is required';
    if (!form.contactEmail.trim()) e.contactEmail = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email';
    if (new Date(form.expirationDate) <= new Date(form.effectiveDate)) e.expirationDate = 'Expiration must be after effective date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const field = (
    key: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-xs font-medium text-neu-dark-slate mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`neu-input ${errors[key] ? 'border-red-400' : ''}`}
        placeholder={placeholder}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-5 border-b border-neu-gold-pale flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 100%)' }}>
            <h2 className="font-syne font-bold text-white text-lg">
              {moa ? 'Edit MOA Entry' : 'Add New MOA Entry'}
            </h2>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {field('hteId', 'HTE ID *', 'text', 'e.g. HTE-2024-001')}
              {field('companyName', 'Company Name *', 'text', 'Enter company name')}
              <div className="md:col-span-2">
                {field('address', 'Company Address *', 'text', 'Full address')}
              </div>
              {field('contactPerson', 'Contact Person *', 'text', 'Full name')}
              {field('contactEmail', 'Contact Email *', 'email', 'email@company.com')}

              <div>
                <label className="block text-xs font-medium text-neu-dark-slate mb-1">Industry Type</label>
                <select value={form.industryType}
                  onChange={e => setForm(f => ({ ...f, industryType: e.target.value as typeof f.industryType }))}
                  className="neu-input">
                  {INDUSTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neu-dark-slate mb-1">Endorsed by College</label>
                <select value={form.endorsedByCollege}
                  onChange={e => setForm(f => ({ ...f, endorsedByCollege: e.target.value as typeof f.endorsedByCollege }))}
                  className="neu-input">
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {field('effectiveDate', 'Effective Date *', 'date')}
              <div>
                {field('expirationDate', 'Expiration Date *', 'date')}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neu-dark-slate mb-1">MOA Status</label>
                <select value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof f.status }))}
                  className="neu-input">
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-neu-gold-pale flex justify-end gap-3 bg-neu-cream/50">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">
              <Save size={15} />
              {saving ? 'Saving...' : moa ? 'Save Changes' : 'Add MOA'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};