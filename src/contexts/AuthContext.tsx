// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { AppUser, UserRole } from '../types';
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

// Determine role from email domain/pattern — adjust to your institution's logic
const getRoleFromEmail = (email: string): UserRole => {
  // Admins: specific admin emails or pattern
  if (email.includes('admin') || email.endsWith('@admin.neu.edu.ph')) return 'admin';
  // Faculty: faculty pattern
  if (email.includes('faculty') || email.endsWith('@faculty.neu.edu.ph')) return 'faculty';
  // Default: student
  return 'student';
};

// NEU domain check — adjust to your actual domain
const isNEUEmail = (email: string): boolean => {
  // Accept any neu.edu.ph domain for demo; tighten as needed
  return email.endsWith('@neu.edu.ph') ||
    email.endsWith('@faculty.neu.edu.ph') ||
    email.endsWith('@admin.neu.edu.ph') ||
    // For development/demo: allow gmail too (remove in production)
    email.endsWith('@gmail.com');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
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
            // New user — create profile
            const role = getRoleFromEmail(fbUser.email || '');
            const newUser: Omit<AppUser, 'uid'> = {
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
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
          console.error('Error fetching user:', err);
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsub;
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
      if (err instanceof Error && err.message.includes('popup-closed')) return;
      toast.error('Sign-in failed. Please try again.');
      console.error(err);
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