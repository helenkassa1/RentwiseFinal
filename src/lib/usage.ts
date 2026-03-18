// ============================================================
// USAGE TRACKING — Lease Review Limits
// ============================================================

// --- ANONYMOUS USERS (localStorage) ---

const ANON_REVIEW_KEY = "rentwise_anon_reviews";

export function getAnonReviewCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(ANON_REVIEW_KEY);
    if (!stored) return 0;
    const data = JSON.parse(stored);
    return data.count || 0;
  } catch {
    return 0;
  }
}

export function incrementAnonReviewCount(): void {
  if (typeof window === "undefined") return;
  const current = getAnonReviewCount();
  localStorage.setItem(
    ANON_REVIEW_KEY,
    JSON.stringify({
      count: current + 1,
      lastUsed: new Date().toISOString(),
    })
  );
}

export function hasAnonReviewsRemaining(): boolean {
  return getAnonReviewCount() < 1;
}

// --- AUTHENTICATED USERS ---

// Define the access check result type
export type AccessResult = {
  allowed: boolean;
  reason?:
    | "anonymous_limit"
    | "monthly_limit"
    | "plan_required"
    | "auth_required";
  remaining?: number;
};

// Define the user shape we need for access checks
export type RentWiseUser = {
  id: string;
  role: "tenant" | "landlord" | "pm";
  plan: "free" | "pro" | "pm";
} | null;

// For authenticated users, count reviews this month
// NOTE: Replace this with your actual database query.
// For now, we use Clerk metadata as a simple counter.
export async function getMonthlyReviewCount(
  userId: string
): Promise<number> {
  // TODO: Replace with actual database query when ready
  // const { count } = await supabase
  //   .from('lease_reviews')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('user_id', userId)
  //   .gte('created_at', getFirstOfMonth());
  // return count || 0;

  // Simple approach: return 0 for now — wire up in production
  void userId;
  return 0;
}

// --- MAIN ACCESS CHECK ---

export async function canUserReview(
  user: RentWiseUser
): Promise<AccessResult> {
  // Anonymous user
  if (!user) {
    if (hasAnonReviewsRemaining()) {
      return { allowed: true, remaining: 1 - getAnonReviewCount() };
    }
    return { allowed: false, reason: "anonymous_limit" };
  }

  // Tenant — always unlimited free reviews
  if (user.role === "tenant") {
    return { allowed: true };
  }

  // Landlord on free plan — 2 per month
  if (user.role === "landlord" && user.plan === "free") {
    const count = await getMonthlyReviewCount(user.id);
    if (count < 2) {
      return { allowed: true, remaining: 2 - count };
    }
    return { allowed: false, reason: "monthly_limit" };
  }

  // Landlord Pro, Property Manager — unlimited
  if (user.plan === "pro" || user.plan === "pm") {
    return { allowed: true };
  }

  // Default: allow
  return { allowed: true };
}

// --- VOUCHER NAVIGATOR ACCESS ---

export function canAccessVoucher(user: RentWiseUser): AccessResult {
  if (!user) {
    return { allowed: false, reason: "auth_required" };
  }
  if (user.role === "tenant") {
    return { allowed: false, reason: "auth_required" }; // redirect to tenant dashboard
  }
  if (user.plan === "free") {
    return { allowed: false, reason: "plan_required" };
  }
  return { allowed: true };
}

// --- HELPER ---

function getFirstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
