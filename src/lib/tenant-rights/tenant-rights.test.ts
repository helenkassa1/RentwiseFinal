/**
 * Unit tests for Tenant Rights: jurisdiction persistence, content mapping, chat context.
 * Run with: npx vitest run src/lib/tenant-rights/tenant-rights.test.ts
 * (Requires: npm i -D vitest)
 */

import { getCategory, getRuleCardsForCategory } from "./categories";
import { buildTenantChatContext } from "./tenant-chat-prompts";
import type { Jurisdiction } from "./types";

// ---- Jurisdiction persistence (logic only; actual localStorage is in the UI) ----
export function parseJurisdictionFromQuery(query: string): Jurisdiction | null {
  const params = new URLSearchParams(query);
  const j = params.get("jurisdiction");
  return j === "dc" || j === "pg" ? j : null;
}

export function serializeJurisdictionToQuery(jurisdiction: Jurisdiction): string {
  return `jurisdiction=${jurisdiction}`;
}

// ---- Content mapping per jurisdiction ----
export function getRuleCardsForCategoryAndJurisdiction(categoryId: string, jurisdiction: Jurisdiction) {
  const category = getCategory(categoryId);
  if (!category) return [];
  return getRuleCardsForCategory(category, jurisdiction);
}

// ========== Tests (Vitest/Jest style) ==========
function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
    },
    toBeNull() {
      if (actual != null) throw new Error(`Expected null, got ${String(actual)}`);
    },
    toBeGreaterThan(n: number) {
      if (typeof actual !== "number" || actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
    toContain(sub: string) {
      if (typeof actual !== "string" || !actual.includes(sub)) throw new Error(`Expected string to contain "${sub}"`);
    },
  };
}

export const tests = {
  jurisdiction_persistence: () => {
    expect(parseJurisdictionFromQuery("?jurisdiction=dc")).toBe("dc");
    expect(parseJurisdictionFromQuery("?jurisdiction=pg")).toBe("pg");
    expect(parseJurisdictionFromQuery("?jurisdiction=other")).toBeNull();
    expect(parseJurisdictionFromQuery("")).toBeNull();
    expect(serializeJurisdictionToQuery("dc")).toBe("jurisdiction=dc");
  },

  content_mapping_per_jurisdiction: () => {
    const evictionDc = getRuleCardsForCategoryAndJurisdiction("eviction-termination", "dc");
    const evictionPg = getRuleCardsForCategoryAndJurisdiction("eviction-termination", "pg");
    expect(evictionDc.length).toBeGreaterThan(0);
    expect(evictionPg.length).toBeGreaterThan(0);
    expect(evictionDc.some((c) => c.title.toLowerCase().includes("self-help") || c.plainEnglish.toLowerCase().includes("lock"))).toBe(true);
    expect(evictionPg.some((c) => c.title.toLowerCase().includes("self-help") || c.plainEnglish.toLowerCase().includes("lock"))).toBe(true);

    const repairsDc = getRuleCardsForCategoryAndJurisdiction("repairs-withholding", "dc");
    const repairsPg = getRuleCardsForCategoryAndJurisdiction("repairs-withholding", "pg");
    expect(repairsDc.length).toBeGreaterThan(0);
    expect(repairsPg.length).toBeGreaterThan(0);

    const habitabilityDc = getRuleCardsForCategoryAndJurisdiction("habitability", "dc");
    expect(habitabilityDc.length).toBe(0);
  },

  chat_context_includes_jurisdiction_and_category: () => {
    const ctx = buildTenantChatContext({
      jurisdiction: "dc",
      selectedCategory: "Eviction & Termination Protections",
      selectedSubtopic: "notice-to-quit",
    });
    expect(ctx).toContain("dc");
    expect(ctx).toContain("Eviction & Termination Protections");
    expect(ctx).toContain("notice-to-quit");

    const ctxPg = buildTenantChatContext({ jurisdiction: "pg", selectedCategory: "Repairs, Withholding & \"Repair and Deduct\"" });
    expect(ctxPg).toContain("pg");
    expect(ctxPg).toContain("Repairs");
  },
};

export function runTests(): string[] {
  const results: string[] = [];
  for (const [name, fn] of Object.entries(tests)) {
    try {
      fn();
      results.push(`OK ${name}`);
    } catch (e) {
      results.push(`FAIL ${name}: ${e}`);
    }
  }
  return results;
}
