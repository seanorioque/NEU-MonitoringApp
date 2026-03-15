// src/components/StatusBadge.tsx
import React from "react";
import { type MOAStatus, getStatusGroup, STATUS_COLORS } from "../types/Index";

export const StatusBadge: React.FC<{ status: MOAStatus; small?: boolean }> = ({
  status,
  small,
}) => {
  const group = getStatusGroup(status);
  const colors = STATUS_COLORS[group];
  const label = status.split(": ")[1] || status;
  const prefix = status.split(":")[0];

  return (
    <span
      className={`gold-badge ${colors.bg} ${colors.text} ${colors.border} ${small ? "text-xs" : ""}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      <span className="font-medium">{prefix}:</span>
      <span className="font-normal truncate max-w-xs">{label}</span>
    </span>
  );
};
