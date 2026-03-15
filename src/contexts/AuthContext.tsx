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

// ─── UID → ROLE MAP ──────────────────────────────────────────────────────────
// Add each Google account's UID and the role you want to assign.
// To find a UID: sign in → open Firebase Console → Authentication → Users
//
// Format:  'UID_HERE': 'admin' | 'faculty' | 'student'
//
const UID_ROLES: Record<string, UserRole> = {
  '2AwrmRHKM6Rqlud8pTFpQAtPteu2': 'admin',
  'VuOa7CD7obf3wu9qiSVtWM4eUVh1': 'faculty',
  // add more as needed...
};
// ─────────────────────────────────────────────────────────────────────────────

// Fallback role if a UID is not in the map above
const DEFAULT_ROLE: UserRole = 'student';

// Allow all emails during testing — restrict in production
const isAllowedEmail = (_email: string): boolean => true;
// Production example:
// const isAllowedEmail = (email: string) => email.endsWith('@neu.edu.ph');

const getRoleForUser = (uid: string): UserRole => {
  return UID_ROLES[uid] ?? DEFAULT_ROLE;
};

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

            // Look up role from UID map
            const assignedRole = getRoleForUser(fbUser.uid);

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

              // Update lastLogin and sync role from UID map
              await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
                role: assignedRole,
              });

              setCurrentUser({
                ...data,
                uid: fbUser.uid,
                role: assignedRole,
              });

            } else {
              // First time signing in — create Firestore profile
              const newUser: Omit<AppUser, 'uid'> = {
                email: fbUser.email || '',
                displayName: fbUser.displayName || fbUser.email || 'User',
                photoURL: fbUser.photoURL || '',
                role: assignedRole,
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
            // Fallback — don't leave user stuck on loading screen
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'User',
              photoURL: fbUser.photoURL || '',
              role: getRoleForUser(fbUser.uid),
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
      if (!isAllowedEmail(email)) {
        await firebaseSignOut(auth);
        toast.error('Only authorized email accounts are allowed.');
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