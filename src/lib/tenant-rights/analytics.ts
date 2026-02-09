/**
 * Tenant Rights analytics events. Replace with your analytics provider (e.g. segment, mixpanel).
 */

export type TenantRightsEvent =
  | { name: "jurisdiction_selected"; jurisdiction: string }
  | { name: "category_selected"; categoryId: string }
  | { name: "subtopic_selected"; categoryId: string; subtopicId: string }
  | { name: "chat_started"; jurisdiction?: string; categoryId?: string }
  | { name: "chat_followup_answered"; messageLength?: number };

export function trackTenantRights(event: TenantRightsEvent): void {
  if (typeof window === "undefined") return;
  // Replace with your analytics call, e.g.:
  // analytics.track(event.name, event);
  console.debug("[TenantRights analytics]", event.name, event);
}
