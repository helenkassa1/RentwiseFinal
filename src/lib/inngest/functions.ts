import { inngest } from "./client";
import { db } from "@/lib/db";
import { notifications, complianceDeadlines, maintenanceRequests, leases, users } from "@/lib/db/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";

// ============================================
// Compliance Deadline Checker
// Runs daily, checks for upcoming deadlines
// Sends alerts at: 7 days, 3 days, 1 day, due date
// ============================================
export const checkComplianceDeadlines = inngest.createFunction(
  { id: "check-compliance-deadlines" },
  { cron: "0 8 * * *" }, // Daily at 8 AM
  async ({ step }) => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = await step.run("fetch-deadlines", async () => {
      return db
        .select()
        .from(complianceDeadlines)
        .where(
          and(
            eq(complianceDeadlines.isCompleted, false),
            lte(complianceDeadlines.dueDate, sevenDays),
            gte(complianceDeadlines.dueDate, now)
          )
        );
    });

    for (const deadline of upcomingDeadlines) {
      const dueDate = typeof deadline.dueDate === "string" ? new Date(deadline.dueDate) : (deadline.dueDate as Date);
      const daysUntil = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only send at the right intervals: 7, 3, 1, 0
      if ([7, 3, 1, 0].includes(daysUntil)) {
        await step.run(`notify-${deadline.id}-${daysUntil}d`, async () => {
          const urgency = daysUntil === 0 ? "DUE TODAY" : daysUntil === 1 ? "DUE TOMORROW" : `Due in ${daysUntil} days`;

          await db.insert(notifications).values({
            userId: deadline.userId,
            type: "compliance_deadline",
            title: `${urgency}: ${deadline.title}`,
            message: `${deadline.description || deadline.title}${deadline.statute ? ` (${deadline.statute})` : ""}`,
            metadata: {
              deadlineId: deadline.id,
              daysUntil,
              dueDate: dueDate.toISOString(),
            },
          });

          // TODO: Send email via Resend for critical deadlines
          // Critical deadlines always get email regardless of preferences
        });
      }
    }

    return { processed: upcomingDeadlines.length };
  }
);

// ============================================
// Maintenance Escalation
// Checks for maintenance requests past their legal deadline
// ============================================
export const checkMaintenanceEscalation = inngest.createFunction(
  { id: "check-maintenance-escalation" },
  { cron: "0 */4 * * *" }, // Every 4 hours
  async ({ step }) => {
    const now = new Date();

    const overdueRequests = await step.run("fetch-overdue", async () => {
      return db
        .select()
        .from(maintenanceRequests)
        .where(
          and(
            eq(maintenanceRequests.status, "submitted"),
            lte(maintenanceRequests.legalDeadline, now)
          )
        );
    });

    for (const request of overdueRequests) {
      await step.run(`escalate-${request.id}`, async () => {
        // Notify landlord with escalation
        await db.insert(notifications).values({
          userId: request.landlordId,
          type: "maintenance_escalation",
          title: `⚠️ OVERDUE: Maintenance request past legal deadline`,
          message: `A maintenance request at your property has exceeded the legally required response time. Failure to respond may expose you to legal liability.`,
          metadata: {
            maintenanceRequestId: request.id,
            category: request.category,
          },
        });

        // Notify tenant of their rights/next steps
        if (request.tenantId) {
          const tenant = await db.query.tenants.findFirst({
            where: eq(maintenanceRequests.tenantId, request.tenantId),
          });

          if (tenant?.userId) {
            await db.insert(notifications).values({
              userId: tenant.userId,
              type: "maintenance_escalation",
              title: `Your maintenance request has passed the response deadline`,
              message: `Your landlord has not acknowledged your request within the legally required timeframe. You may have options including filing a complaint or exercising repair-and-deduct rights.`,
              metadata: {
                maintenanceRequestId: request.id,
                nextSteps: (request.aiTriageResult as { tenantNextSteps?: string } | null)?.tenantNextSteps ?? "Contact your local housing authority.",
              },
            });
          }
        }
      });
    }

    return { escalated: overdueRequests.length };
  }
);

// ============================================
// Lease Expiration Alerts
// 60, 30, 14 days before expiration
// ============================================
export const checkLeaseExpirations = inngest.createFunction(
  { id: "check-lease-expirations" },
  { cron: "0 9 * * *" }, // Daily at 9 AM
  async ({ step }) => {
    const now = new Date();
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const expiringLeases = await step.run("fetch-expiring", async () => {
      return db
        .select()
        .from(leases)
        .where(
          and(
            eq(leases.status, "active"),
            lte(leases.endDate, sixtyDays),
            gte(leases.endDate, now)
          )
        );
    });

    for (const lease of expiringLeases) {
      const endDate = lease.endDate == null ? null : typeof lease.endDate === "string" ? new Date(lease.endDate) : (lease.endDate as Date);
      if (!endDate) continue;
      const daysUntil = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if ([60, 30, 14].includes(daysUntil)) {
        await step.run(`lease-expiry-${lease.id}-${daysUntil}d`, async () => {
          await db.insert(notifications).values({
            userId: lease.landlordId,
            type: "lease_expiration",
            title: `Lease expiring in ${daysUntil} days`,
            message: `A lease is expiring on ${endDate.toLocaleDateString()}. Initiate renewal or provide required non-renewal notice per your jurisdiction's laws.`,
            metadata: {
              leaseId: lease.id,
              daysUntil,
              endDate: endDate.toISOString(),
            },
          });
        });
      }
    }

    return { checked: expiringLeases.length };
  }
);

// ============================================
// Tenant Invitation Sender
// Triggered when a tenant is added
// ============================================
export const sendTenantInvitation = inngest.createFunction(
  { id: "send-tenant-invitation" },
  { event: "tenant/invitation.created" },
  async ({ event, step }) => {
    const { tenantEmail, tenantName, landlordName, propertyAddress, invitationToken } = event.data;

    await step.run("send-email", async () => {
      // TODO: Integrate Resend
      console.log(`Sending invitation to ${tenantEmail} for ${propertyAddress}`);
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: "RentWise <noreply@rentwise.app>",
      //   to: tenantEmail,
      //   subject: `${landlordName} has invited you to RentWise`,
      //   html: `...invitation email template...`,
      // });
    });
  }
);

export const inngestFunctions = [
  checkComplianceDeadlines,
  checkMaintenanceEscalation,
  checkLeaseExpirations,
  sendTenantInvitation,
];
