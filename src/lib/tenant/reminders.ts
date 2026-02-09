import type { TenantContext, Notice } from "./types";

export type ReminderType =
  | "rent_due"
  | "grace_period_ends"
  | "lease_ending"
  | "deposit_info_missing";

export type Reminder = {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  dueDate?: string;
  daysUntil?: number;
  severity: "urgent" | "soon" | "info";
};

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

/** Next rent due date from a given date. Exported for SnapshotCards etc. */
export function nextRentDueDate(ctx: TenantContext, from: Date): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), Math.min(ctx.rent.dueDay, 28));
  if (d <= from) d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * Compute reminders for the tenant dashboard.
 * TODO: Wire to real push/email scheduling.
 */
export function computeReminders(ctx: TenantContext, asOf: Date = new Date()): Reminder[] {
  const reminders: Reminder[] = [];
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  // Next rent due
  const nextRent = nextRentDueDate(ctx, asOf);
  const daysToRent = daysBetween(asOf, nextRent);
  if (daysToRent <= 7) {
    reminders.push({
      id: "rent-due",
      type: "rent_due",
      title: daysToRent <= 0 ? "Rent due today" : `Rent due in ${daysToRent} day${daysToRent === 1 ? "" : "s"}`,
      description: `$${ctx.rent.amount} due on ${iso(nextRent)}.`,
      dueDate: iso(nextRent),
      daysUntil: daysToRent,
      severity: daysToRent <= 2 ? "urgent" : "soon",
    });
  }

  // Grace period ends
  if (ctx.rent.gracePeriodDays != null && ctx.rent.gracePeriodDays > 0) {
    const graceEnd = addDays(nextRent, ctx.rent.gracePeriodDays);
    const daysToGrace = daysBetween(asOf, graceEnd);
    if (daysToRent <= 0 && daysToGrace > 0 && daysToGrace <= 5) {
      reminders.push({
        id: "grace-ends",
        type: "grace_period_ends",
        title: `Grace period ends ${iso(graceEnd)}`,
        description: ctx.rent.waiverInfo ?? "Late fee may apply after this date.",
        dueDate: iso(graceEnd),
        daysUntil: daysToGrace,
        severity: daysToGrace <= 1 ? "urgent" : "soon",
      });
    }
  }

  // Lease ending
  const leaseEnd = new Date(ctx.lease.endDate);
  const daysToLeaseEnd = daysBetween(asOf, leaseEnd);
  if (daysToLeaseEnd > 0 && daysToLeaseEnd <= 60) {
    reminders.push({
      id: "lease-ending",
      type: "lease_ending",
      title: `Lease ends in ${daysToLeaseEnd} days`,
      description: `Your lease ends on ${ctx.lease.endDate}. Consider renewal or move-out notice.`,
      dueDate: ctx.lease.endDate,
      daysUntil: daysToLeaseEnd,
      severity: daysToLeaseEnd <= 30 ? "soon" : "info",
    });
  }

  // Deposit info missing
  if (!ctx.deposit.bankName && !ctx.deposit.accountMasked) {
    reminders.push({
      id: "deposit-missing",
      type: "deposit_info_missing",
      title: "Deposit account info not on file",
      description: "Request your landlord to provide where your security deposit is held (required in DC).",
      severity: "info",
    });
  }

  return reminders;
}

/**
 * Get unread notices for alerts panel.
 */
export function getUnreadNotices(notices: Notice[]): Notice[] {
  return notices.filter((n) => !n.read);
}
