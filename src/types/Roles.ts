import type { UserRole } from "./UserRole";

<<<<<<< HEAD
const adminUids = import.meta.env.VITE_ADMIN_UID?.split(",") ?? [];
const facultyUids = import.meta.env.VITE_FACULTY_UID?.split(",") ?? [];

const facultyEmails = import.meta.env.VITE_FACULTY_EMAIL?.split(",") ?? [];
const adminEmails = import.meta.env.VITE_ADMIN_EMAIL?.split(",") ?? [];

export const UID_ROLES: Record<string, UserRole> = Object.fromEntries([
  ...adminUids.map((uid) => [uid.trim(), "admin" as UserRole]),
  ...facultyUids.map((uid) => [uid.trim(), "faculty" as UserRole]),
]);

export const EMAIL_ROLES: Record<string, UserRole> = Object.fromEntries([
  ...adminEmails.map((email) => [email.trim(), "admin" as UserRole]),
  ...facultyEmails.map((email) => [email.trim(), "faculty" as UserRole]),
]);
=======
export const UID_ROLES: Record<string, UserRole> = {
  "2AwrmRHKM6Rqlud8pTFpQAtPteu2": "admin",
  "9ceCEjZAypfRUyANi5wRpstDRgy1": "faculty",
  // add more as needed...
};
// ─────────────────────────────────────────────────────────────────────────────
>>>>>>> 8d50185c5ab90b080a271c3b1076ed3ce6793779

export const DEFAULT_ROLE: UserRole = "student";
