import { mapInspectionStatusToDisplay } from "../status/statusDisplay";
import type { InspectionStatus } from "../../api/contracts";

interface StatusBadgeProps {
  status: InspectionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const display = mapInspectionStatusToDisplay(status);
  return (
    <span className={`status-badge status-badge--${display.tone}`} title={display.description}>
      {display.label}
    </span>
  );
}
