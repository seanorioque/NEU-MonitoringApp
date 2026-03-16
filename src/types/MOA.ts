import type { MOAStatus, IndustryType, College } from "./types";
import type { AuditEntry } from "./Audit";

export interface MOA {
  id: string;
  hteId: string;
  companyName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  industryType: IndustryType;
  effectiveDate: Date;
  expirationDate: Date;
  status: MOAStatus;
  endorsedByCollege: College;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  auditTrail: AuditEntry[];
}
export interface Props {
  moas: MOA[];
}

export type MOAStatusGroup = "APPROVED" | "PROCESSING" | "EXPIRED" | "EXPIRING";

export const getStatusGroup = (status: MOAStatus): MOAStatusGroup => {
  if (status.startsWith("APPROVED")) return "APPROVED";
  if (status.startsWith("PROCESSING")) return "PROCESSING";
  if (status.startsWith("EXPIRED")) return "EXPIRED";
  return "EXPIRING";
};

export const STATUS_COLORS: Record<
  MOAStatusGroup,
  { bg: string; text: string; border: string; dot: string }
> = {
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  PROCESSING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  EXPIRED: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  EXPIRING: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
};

export const ALL_STATUSES: MOAStatus[] = [
  "APPROVED: Signed by President",
  "APPROVED: On-going notarization",
  "APPROVED: No notarization needed",
  "PROCESSING: Awaiting signature of the MOA draft by HTE partner",
  "PROCESSING: MOA draft sent to Legal Office for Review",
  "PROCESSING: MOA draft and opinion of legal office sent to VPAA/OP for approval",
  "EXPIRED: No renewal done",
  "EXPIRING: Two months before expiration",
];
