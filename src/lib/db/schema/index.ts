/**
 * RentWise DB Schema — Drizzle ORM
 * Matches migration 0000_great_zeigeist.sql
 * PRD: AI-Powered Property Management Platform
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============ Enums (match migration) ============
export const conditionRatingEnum = pgEnum("condition_rating", [
  "excellent",
  "good",
  "fair",
  "damaged",
  "not_applicable",
]);
export const confidenceLevelEnum = pgEnum("confidence_level", [
  "high",
  "medium",
  "low",
]);
export const flagSeverityEnum = pgEnum("flag_severity", [
  "red",
  "yellow",
  "blue",
]);
export const inspectionTypeEnum = pgEnum("inspection_type", [
  "move_in",
  "move_out",
]);
export const jurisdictionEnum = pgEnum("jurisdiction", [
  "dc",
  "maryland",
  "pg_county",
]);
export const leaseStatusEnum = pgEnum("lease_status", [
  "draft",
  "active",
  "expired",
  "terminated",
]);
export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
  "emergency",
  "urgent",
  "routine",
]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "submitted",
  "acknowledged",
  "scheduled",
  "in_progress",
  "completed",
  "tenant_confirmed",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "compliance_deadline",
  "lease_expiration",
  "maintenance_escalation",
  "rent_increase",
  "general",
]);
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "landlord_pro",
  "property_manager",
]);
export const unitStatusEnum = pgEnum("unit_status", [
  "vacant",
  "occupied",
  "maintenance",
]);
export const userRoleEnum = pgEnum("user_role", [
  "private_landlord",
  "small_pm",
  "professional_pm",
  "tenant",
  "admin",
]);

// ============ Users ============
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").default("private_landlord").notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  notificationPreferences: jsonb("notification_preferences").default(
    JSON.stringify({ email: true, inApp: true, criticalOnly: false })
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Organizations ============
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ Properties & Units ============
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: varchar("name", { length: 200 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  imageUrl: text("image_url"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  jurisdiction: jurisdictionEnum("jurisdiction").notNull(),
  propertyType: varchar("property_type", { length: 50 }).default(
    "residential"
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  identifier: varchar("identifier", { length: 100 }).notNull(),
  status: unitStatusEnum("status").default("vacant").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: integer("square_feet"),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }),
  isVoucherUnit: boolean("is_voucher_unit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Tenants & Applications ============
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  invitationToken: varchar("invitation_token", { length: 255 }),
  invitationSentAt: timestamp("invitation_sent_at"),
  invitationAcceptedAt: timestamp("invitation_accepted_at"),
  isVoucherTenant: boolean("is_voucher_tenant").default(false).notNull(),
  voucherType: varchar("voucher_type", { length: 100 }),
  moveInDate: timestamp("move_in_date"),
  moveOutDate: timestamp("move_out_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tenantApplications = pgTable("tenant_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id),
  applicantName: varchar("applicant_name", { length: 255 }).notNull(),
  applicantEmail: varchar("applicant_email", { length: 255 }).notNull(),
  applicationData: jsonb("application_data"),
  screeningResults: jsonb("screening_results"),
  incomeVerification: jsonb("income_verification"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  decision: varchar("decision", { length: 50 }),
  adverseActionSent: boolean("adverse_action_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Leases ============
export const leases = pgTable("leases", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id),
  jurisdiction: jurisdictionEnum("jurisdiction").notNull(),
  status: leaseStatusEnum("status").default("draft").notNull(),
  isVoucherLease: boolean("is_voucher_lease").default(false).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }),
  securityDeposit: numeric("security_deposit", { precision: 10, scale: 2 }),
  leaseContent: text("lease_content"),
  leaseFileUrl: text("lease_file_url"),
  originalFileUrl: text("original_file_url"),
  reviewResults: jsonb("review_results"),
  reviewCompletedAt: timestamp("review_completed_at"),
  complianceScore: integer("compliance_score"),
  templateData: jsonb("template_data"),
  customClauses: jsonb("custom_clauses"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Legal Statutes (citation verification, PRD §4.2) ============
export const legalStatutes = pgTable("legal_statutes", {
  id: uuid("id").primaryKey().defaultRandom(),
  jurisdiction: jurisdictionEnum("jurisdiction").notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull(),
  fullText: text("full_text"),
  category: varchar("category", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastVerified: timestamp("last_verified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Maintenance Requests ============
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  photos: jsonb("photos").default(JSON.stringify([])),
  urgency: maintenancePriorityEnum("urgency").default("routine").notNull(),
  aiTriageResult: jsonb("ai_triage_result"),
  status: maintenanceStatusEnum("status").default("submitted").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  tenantConfirmedDate: timestamp("tenant_confirmed_date"),
  legalDeadline: timestamp("legal_deadline"),
  notes: jsonb("notes").default(JSON.stringify([])),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Inspections ============
export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id),
  type: inspectionTypeEnum("type").notNull(),
  inspectionDate: timestamp("inspection_date").notNull(),
  rooms: jsonb("rooms").default(JSON.stringify([])).notNull(),
  landlordSignature: text("landlord_signature"),
  tenantSignature: text("tenant_signature"),
  landlordSignedAt: timestamp("landlord_signed_at"),
  tenantSignedAt: timestamp("tenant_signed_at"),
  comparisonResults: jsonb("comparison_results"),
  // Self-reference FK defined in migration; omit .references() to avoid circular type
  linkedMoveInInspectionId: uuid("linked_move_in_inspection_id"),
  exportedPdfUrl: text("exported_pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ Notifications ============
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false).notNull(),
  emailSent: boolean("email_sent").default(false).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ Compliance Deadlines ============
export const complianceDeadlines = pgTable("compliance_deadlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  propertyId: uuid("property_id").references(() => properties.id),
  unitId: uuid("unit_id").references(() => units.id),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  statute: varchar("statute", { length: 255 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ Lease Review Result (in-memory/API type, not a table) ============
/** AI lease review issue — PRD §4.2 Lease Agreement Reviewer */
export type LeaseReviewResult = {
  id: string;
  issueType: "prohibited" | "risky" | "missing";
  severity: "red" | "yellow" | "blue";
  title: string;
  summary: string;
  problematicText?: string;
  explanation: string;
  citedStatute: string;
  suggestedAction: string;
  suggestedReplacement?: string;
  confidenceLevel: "high" | "medium" | "low";
  status?: "pending" | "accepted" | "rejected" | "flagged";
};
