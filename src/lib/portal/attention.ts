import type { AttentionStatus, PortalProperty } from "./types";

export function getPropertyAttentionStatus(p: PortalProperty): AttentionStatus {
  if (p.complianceDeadlinesSoon > 0) return "urgent";
  if (p.openMaintenance > 0 && p.unreadMessages > 0) return "urgent";
  if (
    p.openMaintenance > 0 ||
    p.pendingApplications > 0 ||
    p.unreadMessages > 0
  )
    return "attention";
  return "healthy";
}

export function attentionLabel(status: AttentionStatus): string {
  if (status === "urgent") return "Urgent";
  if (status === "attention") return "Needs attention";
  return "Healthy";
}
