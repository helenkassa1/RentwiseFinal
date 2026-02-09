CREATE TYPE "public"."condition_rating" AS ENUM('excellent', 'good', 'fair', 'damaged', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."flag_severity" AS ENUM('red', 'yellow', 'blue');--> statement-breakpoint
CREATE TYPE "public"."inspection_type" AS ENUM('move_in', 'move_out');--> statement-breakpoint
CREATE TYPE "public"."jurisdiction" AS ENUM('dc', 'maryland', 'pg_county');--> statement-breakpoint
CREATE TYPE "public"."lease_status" AS ENUM('draft', 'active', 'expired', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."maintenance_priority" AS ENUM('emergency', 'urgent', 'routine');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('submitted', 'acknowledged', 'scheduled', 'in_progress', 'completed', 'tenant_confirmed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('compliance_deadline', 'lease_expiration', 'maintenance_escalation', 'rent_increase', 'general');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'landlord_pro', 'property_manager');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('vacant', 'occupied', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('private_landlord', 'small_pm', 'professional_pm', 'tenant', 'admin');--> statement-breakpoint
CREATE TABLE "compliance_deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_id" uuid,
	"unit_id" uuid,
	"type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp NOT NULL,
	"statute" varchar(255),
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"tenant_id" uuid,
	"landlord_id" uuid NOT NULL,
	"type" "inspection_type" NOT NULL,
	"inspection_date" timestamp NOT NULL,
	"rooms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"landlord_signature" text,
	"tenant_signature" text,
	"landlord_signed_at" timestamp,
	"tenant_signed_at" timestamp,
	"comparison_results" jsonb,
	"linked_move_in_inspection_id" uuid,
	"exported_pdf_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"tenant_id" uuid,
	"landlord_id" uuid NOT NULL,
	"jurisdiction" "jurisdiction" NOT NULL,
	"status" "lease_status" DEFAULT 'draft' NOT NULL,
	"is_voucher_lease" boolean DEFAULT false NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"rent_amount" numeric(10, 2),
	"security_deposit" numeric(10, 2),
	"lease_content" text,
	"lease_file_url" text,
	"original_file_url" text,
	"review_results" jsonb,
	"review_completed_at" timestamp,
	"compliance_score" integer,
	"template_data" jsonb,
	"custom_clauses" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_statutes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction" "jurisdiction" NOT NULL,
	"code" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"summary" text NOT NULL,
	"full_text" text,
	"category" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"urgency" "maintenance_priority" DEFAULT 'routine' NOT NULL,
	"ai_triage_result" jsonb,
	"status" "maintenance_status" DEFAULT 'submitted' NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"tenant_confirmed_date" timestamp,
	"legal_deadline" timestamp,
	"notes" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"email_sent" boolean DEFAULT false NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" varchar(200),
	"address" text NOT NULL,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(10),
	"image_url" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"jurisdiction" "jurisdiction" NOT NULL,
	"property_type" varchar(50) DEFAULT 'residential',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"applicant_name" varchar(255) NOT NULL,
	"applicant_email" varchar(255) NOT NULL,
	"application_data" jsonb,
	"screening_results" jsonb,
	"income_verification" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"decision" varchar(50),
	"adverse_action_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"unit_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"invitation_token" varchar(255),
	"invitation_sent_at" timestamp,
	"invitation_accepted_at" timestamp,
	"is_voucher_tenant" boolean DEFAULT false NOT NULL,
	"voucher_type" varchar(100),
	"move_in_date" timestamp,
	"move_out_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"status" "unit_status" DEFAULT 'vacant' NOT NULL,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"square_feet" integer,
	"rent_amount" numeric(10, 2),
	"is_voucher_unit" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"role" "user_role" DEFAULT 'private_landlord' NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar(255),
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"notification_preferences" jsonb DEFAULT '{"email":true,"inApp":true,"criticalOnly":false}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "compliance_deadlines" ADD CONSTRAINT "compliance_deadlines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_deadlines" ADD CONSTRAINT "compliance_deadlines_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_deadlines" ADD CONSTRAINT "compliance_deadlines_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_linked_move_in_inspection_id_inspections_id_fk" FOREIGN KEY ("linked_move_in_inspection_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_applications" ADD CONSTRAINT "tenant_applications_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_applications" ADD CONSTRAINT "tenant_applications_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deadlines_user_idx" ON "compliance_deadlines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deadlines_due_date_idx" ON "compliance_deadlines" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "inspections_unit_idx" ON "inspections" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "leases_unit_idx" ON "leases" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "leases_landlord_idx" ON "leases" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "statutes_jurisdiction_idx" ON "legal_statutes" USING btree ("jurisdiction");--> statement-breakpoint
CREATE INDEX "statutes_category_idx" ON "legal_statutes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "statutes_code_idx" ON "legal_statutes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "maintenance_unit_idx" ON "maintenance_requests" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "maintenance_tenant_idx" ON "maintenance_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "maintenance_landlord_idx" ON "maintenance_requests" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "maintenance_status_idx" ON "maintenance_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "properties_owner_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "properties_org_idx" ON "properties" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tenants_unit_idx" ON "tenants" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "tenants_landlord_idx" ON "tenants" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "tenants_user_idx" ON "tenants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "units_property_idx" ON "units" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");