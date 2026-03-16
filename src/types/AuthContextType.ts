import type { AppUser } from "./AppUser";
import {

  type User as FirebaseUser,
} from "firebase/auth";

export interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
