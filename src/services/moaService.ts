// src/services/moaService.ts
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
  getDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MOA, AppUser, AuditEntry, UserRole } from '../types/Index';

// --- Helpers ---
const toDate = (v: unknown): Date => {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date(v as string);
};

const serializeMOA = (data: Record<string, unknown>): MOA => ({
  id: data.id as string,
  hteId: data.hteId as string,
  companyName: data.companyName as string,
  address: data.address as string,
  contactPerson: data.contactPerson as string,
  contactEmail: data.contactEmail as string,
  industryType: data.industryType as MOA['industryType'],
  effectiveDate: toDate(data.effectiveDate),
  expirationDate: toDate(data.expirationDate),
  status: data.status as MOA['status'],
  endorsedByCollege: data.endorsedByCollege as MOA['endorsedByCollege'],
  isDeleted: Boolean(data.isDeleted),
  deletedAt: data.deletedAt ? toDate(data.deletedAt) : undefined,
  deletedBy: data.deletedBy as string | undefined,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  auditTrail: ((data.auditTrail as unknown[]) || []).map((a) => {
    const ae = a as Record<string, unknown>;
    return {
      ...ae,
      timestamp: toDate(ae.timestamp),
    } as AuditEntry;
  }),
});

// --- MOA CRUD ---
export const getMOAs = async (role: UserRole): Promise<MOA[]> => {
  const ref = collection(db, 'moas');
  let q;
  if (role === 'admin') {
    q = query(ref, orderBy('createdAt', 'desc'));
  } else {
    q = query(ref, where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => serializeMOA({ id: d.id, ...d.data() }));
};

export const addMOA = async (
  data: Omit<MOA, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'isDeleted'>,
  actor: AppUser
): Promise<string> => {
  const audit: AuditEntry = {
    userId: actor.uid,
    userName: actor.displayName,
    userEmail: actor.email,
    operation: 'INSERT',
    timestamp: new Date(),
  };
  const ref = await addDoc(collection(db, 'moas'), {
    ...data,
    effectiveDate: Timestamp.fromDate(data.effectiveDate),
    expirationDate: Timestamp.fromDate(data.expirationDate),
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    auditTrail: [{ ...audit, timestamp: Timestamp.fromDate(audit.timestamp) }],
  });
  return ref.id;
};

export const updateMOA = async (
  id: string,
  updates: Partial<Omit<MOA, 'id' | 'auditTrail' | 'createdAt'>>,
  actor: AppUser,
  prevData: MOA
): Promise<void> => {
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  (Object.keys(updates) as (keyof typeof updates)[]).forEach((key) => {
    if (String(prevData[key]) !== String(updates[key])) {
      changes[key] = { before: prevData[key], after: updates[key] };
    }
  });
  const audit: AuditEntry = {
    userId: actor.uid,
    userName: actor.displayName,
    userEmail: actor.email,
    operation: 'UPDATE',
    timestamp: new Date(),
    changes,
  };
  const payload: Record<string, unknown> = { ...updates, updatedAt: serverTimestamp() };
  if (updates.effectiveDate) payload.effectiveDate = Timestamp.fromDate(updates.effectiveDate);
  if (updates.expirationDate) payload.expirationDate = Timestamp.fromDate(updates.expirationDate);

  const ref = doc(db, 'moas', id);
  const snap = await getDoc(ref);
  const existing = snap.data()?.auditTrail || [];
  await updateDoc(ref, {
    ...payload,
    auditTrail: [...existing, { ...audit, timestamp: Timestamp.fromDate(audit.timestamp) }],
  });
};

export const softDeleteMOA = async (id: string, actor: AppUser): Promise<void> => {
  const audit: AuditEntry = {
    userId: actor.uid,
    userName: actor.displayName,
    userEmail: actor.email,
    operation: 'DELETE',
    timestamp: new Date(),
  };
  const ref = doc(db, 'moas', id);
  const snap = await getDoc(ref);
  const existing = snap.data()?.auditTrail || [];
  await updateDoc(ref, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: actor.uid,
    updatedAt: serverTimestamp(),
    auditTrail: [...existing, { ...audit, timestamp: Timestamp.fromDate(audit.timestamp) }],
  });
};

export const restoreMOA = async (id: string, actor: AppUser): Promise<void> => {
  const audit: AuditEntry = {
    userId: actor.uid,
    userName: actor.displayName,
    userEmail: actor.email,
    operation: 'RESTORE',
    timestamp: new Date(),
  };
  const ref = doc(db, 'moas', id);
  const snap = await getDoc(ref);
  const existing = snap.data()?.auditTrail || [];
  await updateDoc(ref, {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    updatedAt: serverTimestamp(),
    auditTrail: [...existing, { ...audit, timestamp: Timestamp.fromDate(audit.timestamp) }],
  });
};

// --- User Management ---
export const getUsers = async (): Promise<AppUser[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<AppUser, 'uid'>),
    uid: d.id,
    createdAt: toDate(d.data().createdAt),
    lastLogin: toDate(d.data().lastLogin),
  }));
};

export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { role });
};

export const toggleUserBlock = async (uid: string, isBlocked: boolean): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { isBlocked });
};

export const toggleFacultyMaintain = async (uid: string, canMaintain: boolean): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { canMaintainMOA: canMaintain });
};

export const batchSeedData = async (): Promise<void> => {
  // Use for initial demo data seeding
  const batch = writeBatch(db);
  console.log('Seed function ready. Add seed data here.', batch);
};