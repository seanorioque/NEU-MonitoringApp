import type { UserRole } from "./UserRole";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: Date;
  lastLogin: Date;
  canMaintainMOA: boolean; 
}