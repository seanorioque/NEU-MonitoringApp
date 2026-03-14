// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import type { AppUser, UserRole } from '../types/Index';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── DEV TESTING OVERRIDE ────────────────────────────────────────────────────
// Change this to switch roles instantly without needing multiple accounts.
// Options: 'admin' | 'faculty' | 'student' | null (null = use Firestore role)
const DEV_ROLE: UserRole | null = 'admin';
// ─────────────────────────────────────────────────────────────────────────────

const getRoleFromEmail = (email: string): UserRole => {
  if (DEV_ROLE) return DEV_ROLE;
  if (email.endsWith('@admin.neu.edu.ph')) return 'admin';
  if (email.endsWith('@faculty.neu.edu.ph')) return 'faculty';
  return 'student';
};

// Allow all emails during testing — restrict in production
const isNEUEmail = (_email: string): boolean => true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser);
          try {
            const userRef = doc(db, 'users', fbUser.uid);
            const snap = await getDoc(userRef);

            if (snap.exists()) {
              const data = snap.data() as AppUser;

              if (data.isBlocked) {
                toast.error('Your account has been blocked. Contact the administrator.');
                await firebaseSignOut(auth);
                setCurrentUser(null);
                setFirebaseUser(null);
                setLoading(false);
                return;
              }

              // DEV: force override role even for existing Firestore users
              const resolvedRole: UserRole = DEV_ROLE ?? data.role;

              await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
                // DEV: also persist the forced role so UI reflects it
                ...(DEV_ROLE ? { role: DEV_ROLE } : {}),
              });

              setCurrentUser({
                ...data,
                uid: fbUser.uid,
                role: resolvedRole,
              });

            } else {
              // New user — create Firestore profile
              const role = getRoleFromEmail(fbUser.email || '');
              const newUser: Omit<AppUser, 'uid'> = {
                email: fbUser.email || '',
                displayName: fbUser.displayName || fbUser.email || 'User',
                photoURL: fbUser.photoURL || '',
                role,
                isBlocked: false,
                createdAt: new Date(),
                lastLogin: new Date(),
                canMaintainMOA: false,
              };
              await setDoc(userRef, newUser);
              setCurrentUser({ ...newUser, uid: fbUser.uid });
            }

          } catch (err) {
            console.error('Firestore error:', err);
            // Fallback so app does not get stuck on loading
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'User',
              photoURL: fbUser.photoURL || '',
              role: DEV_ROLE ?? 'student',
              isBlocked: false,
              createdAt: new Date(),
              lastLogin: new Date(),
              canMaintainMOA: false,
            });
          }
        } else {
          setFirebaseUser(null);
          setCurrentUser(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Firebase Auth init failed:', err);
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';
      if (!isNEUEmail(email)) {
        await firebaseSignOut(auth);
        toast.error('Only NEU institutional email accounts are allowed.');
      }
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'auth/popup-closed-by-user') return;
      if (error.code === 'auth/cancelled-popup-request') return;
      console.error('Sign-in error:', err);
      toast.error('Sign-in failed. Please try again.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    toast.success('Signed out successfully.');
  };

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};