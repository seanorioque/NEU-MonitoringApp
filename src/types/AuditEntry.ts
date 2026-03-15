export interface AuditEntry {
  userId: string;
  userName: string;
  userEmail: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE';
  timestamp: Date;
  changes?: Record<string, { before: unknown; after: unknown }>;
}
