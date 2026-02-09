export type UserRole = "landlord" | "property_manager" | "tenant";

export type AttentionStatus = "urgent" | "attention" | "healthy";

export type PortalProperty = {
  id: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  unitsCount: number;
  clientId?: string;
  openMaintenance: number;
  pendingApplications: number;
  complianceDeadlinesSoon: number;
  unreadMessages: number;
};

export type Client = {
  id: string;
  name: string;
};
