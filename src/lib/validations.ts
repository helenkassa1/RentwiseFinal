import { z } from "zod";

// ============================================
// User & Auth Schemas
// ============================================

export const userRoleSchema = z.enum([
  "private_landlord",
  "small_pm",
  "professional_pm",
  "tenant",
  "admin",
]);

export const jurisdictionSchema = z.enum(["dc", "maryland", "pg_county"]);

// ============================================
// Onboarding Schemas
// ============================================

export const onboardingStep1Schema = z.object({
  role: userRoleSchema,
});

export const onboardingStep2Schema = z.object({
  jurisdictions: z.array(jurisdictionSchema).min(1, "Select at least one jurisdiction"),
});

export const propertySchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code required"),
  jurisdiction: jurisdictionSchema,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const propertyUpdateSchema = z.object({
  name: z.string().max(200).optional(),
  imageUrl: z.string().url().or(z.string().startsWith("data:")).optional().nullable(),
});

export const unitSchema = z.object({
  identifier: z.string().min(1, "Unit identifier is required"),
  status: z.enum(["vacant", "occupied"]),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  rentAmount: z.string().optional(),
  isVoucherUnit: z.boolean().default(false),
});

export const tenantInviteSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  email: z.string().email("Valid email required"),
});

// ============================================
// Lease Schemas
// ============================================

export const leaseTemplateSchema = z.object({
  jurisdiction: jurisdictionSchema,
  isVoucher: z.boolean().default(false),
  landlordName: z.string().min(1),
  tenantName: z.string().min(1),
  propertyAddress: z.string().min(1),
  unitIdentifier: z.string().min(1),
  rentAmount: z.string().min(1),
  securityDeposit: z.string().min(1),
  leaseStartDate: z.string().min(1),
  leaseEndDate: z.string().min(1),
  leaseTerm: z.string().default("12 months"),
  // Customizable sections
  petPolicy: z.string().optional(),
  parkingPolicy: z.string().optional(),
  utilitiesIncluded: z.string().optional(),
});

export const leaseReviewSchema = z.object({
  leaseText: z.string().min(100, "Lease text must be at least 100 characters"),
  jurisdiction: jurisdictionSchema,
});

// ============================================
// Maintenance Schemas
// ============================================

export const maintenanceRequestSchema = z.object({
  category: z.enum([
    "plumbing",
    "electrical",
    "hvac",
    "structural",
    "pest",
    "appliance",
    "other",
  ]),
  description: z.string().min(10, "Please provide more detail"),
  urgency: z.enum(["emergency", "urgent", "routine"]),
  photos: z.array(z.string()).max(5, "Maximum 5 photos").optional(),
});

export const maintenanceUpdateSchema = z.object({
  status: z.enum([
    "acknowledged",
    "scheduled",
    "in_progress",
    "completed",
    "tenant_confirmed",
  ]),
  note: z.string().optional(),
  scheduledDate: z.string().optional(),
});

// ============================================
// Inspection Schemas
// ============================================

export const inspectionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.enum(["excellent", "good", "fair", "damaged", "not_applicable"]),
  notes: z.string().optional(),
  photos: z.array(z.string()).max(3).default([]),
});

export const inspectionRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(inspectionItemSchema),
});

export const inspectionSchema = z.object({
  type: z.enum(["move_in", "move_out"]),
  rooms: z.array(inspectionRoomSchema),
});

// ============================================
// Notification Schemas
// ============================================

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
  criticalOnly: z.boolean().default(false),
});

// ============================================
// Rent Increase Schema (PG County PRSA 2024)
// ============================================

export const rentIncreaseSchema = z.object({
  currentRent: z.number().positive(),
  proposedRent: z.number().positive(),
  effectiveDate: z.string(),
  jurisdiction: jurisdictionSchema,
});

// Type exports
export type PropertyInput = z.infer<typeof propertySchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type TenantInviteInput = z.infer<typeof tenantInviteSchema>;
export type LeaseTemplateInput = z.infer<typeof leaseTemplateSchema>;
export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;
export type InspectionInput = z.infer<typeof inspectionSchema>;
