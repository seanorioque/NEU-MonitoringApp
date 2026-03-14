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

const getRoleFromEmail = (email: string): UserRole => {
  if (email.includes('admin') || email.endsWith('@admin.neu.edu.ph')) return 'admin';
  if (email.includes('faculty') || email.endsWith('@faculty.neu.edu.ph')) return 'faculty';
  return 'student';
};

const isNEUEmail = (email: string): boolean => {
  return (
    email.endsWith('@neu.edu.ph') ||
    email.endsWith('@faculty.neu.edu.ph') ||
    email.endsWith('@admin.neu.edu.ph') ||
    email.endsWith('@gmail.com') // remove in production
  );
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
            if (snap.exists()) {
              const data = snap.data() as AppUser;
              if (data.isBlocked) {
                toast.error('Your account has been blocked. Contact the administrator.');
                await firebaseSignOut(auth);
                setCurrentUser(null);
                setFirebaseUser(null);
              } else {
                await updateDoc(userRef, { lastLogin: serverTimestamp() });
                setCurrentUser({ ...data, uid: fbUser.uid });
              }
            } else {
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
            console.error('Firestore error — check Firebase config and Firestore is enabled:', err);
            // Fallback: still let the user in with basic profile
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'User',
              photoURL: fbUser.photoURL || '',
              role: 'student',
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
      console.error('Firebase Auth init failed — check src/lib/firebase.ts config:', err);
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