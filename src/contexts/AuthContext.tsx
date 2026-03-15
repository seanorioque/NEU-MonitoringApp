// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  deleteUser,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import type { AppUser, UserRole } from "../types/Index";
import toast from "react-hot-toast";

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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const UID_ROLES: Record<string, UserRole> = {
  "2AwrmRHKM6Rqlud8pTFpQAtPteu2": "faculty",
  // add more as needed...
};
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ROLE: UserRole = "student";

// Only @neu.edu.ph accounts are allowed
const isNEUEmail = (email: string): boolean => {
  return (
    email.endsWith("@neu.edu.ph") )
};

const getRoleForUser = (uid: string): UserRole => {
  return UID_ROLES[uid] ?? DEFAULT_ROLE;
};

// Deletes the Firestore user doc and Firebase Auth account
const purgeNonNEUAccount = async (fbUser: FirebaseUser) => {
  try {
    // Delete Firestore user document
    const userRef = doc(db, "users", fbUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await deleteDoc(userRef);
    }
  } catch {
    // Firestore delete may fail silently — proceed to delete auth account
  }
  try {
    // Delete Firebase Auth account
    await deleteUser(fbUser);
  } catch {
    // deleteUser can fail if the session is too old — sign out as fallback
    await firebaseSignOut(auth);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const email = fbUser.email || "";

          // ── Block and delete non-NEU accounts immediately ──
          if (!isNEUEmail(email)) {
            toast.error(
              "Access denied. Only @neu.edu.ph accounts are allowed.",
              { duration: 5000 }
            );
            await purgeNonNEUAccount(fbUser);
            setCurrentUser(null);
            setFirebaseUser(null);
            setLoading(false);
            return;
          }

          setFirebaseUser(fbUser);

          try {
            const userRef = doc(db, "users", fbUser.uid);
            const snap = await getDoc(userRef);
            const assignedRole = getRoleForUser(fbUser.uid);

            if (snap.exists()) {
              const data = snap.data() as AppUser;

              if (data.isBlocked) {
                toast.error(
                  "Your account has been blocked. Contact the administrator."
                );
                await firebaseSignOut(auth);
                setCurrentUser(null);
                setFirebaseUser(null);
                setLoading(false);
                return;
              }

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
              // First-time NEU user — create profile
              const newUser: Omit<AppUser, "uid"> = {
                email,
                displayName: fbUser.displayName || email,
                photoURL: fbUser.photoURL || "",
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
            console.error("Firestore error:", err);
            setCurrentUser({
              uid: fbUser.uid,
              email,
              displayName: fbUser.displayName || "User",
              photoURL: fbUser.photoURL || "",
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
      console.error("Firebase Auth init failed:", err);
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || "";

      if (!isNEUEmail(email)) {
        // Delete the account immediately and show error
        await purgeNonNEUAccount(result.user);
        toast.error(
          "Access denied. Only @neu.edu.ph institutional accounts are allowed.",
          { duration: 5000 }
        );
      }
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/popup-closed-by-user") return;
      if (error.code === "auth/cancelled-popup-request") return;
      console.error("Sign-in error:", err);
      toast.error("Sign-in failed. Please try again.");
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    toast.success("Signed out successfully.");
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, firebaseUser, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};