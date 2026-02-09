"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TENANT_RIGHTS_CATEGORIES } from "@/lib/tenant-rights/categories";
import { trackTenantRights } from "@/lib/tenant-rights/analytics";
import type { Category, CategoryId } from "@/lib/tenant-rights/types";
import {
  Home,
  DollarSign,
  FileText,
  ShieldAlert,
  Lock,
  TrendingDown,
  Wrench,
  Scale,
  Users,
  Gavel,
  FileCheck,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  DollarSign,
  FileText,
  ShieldAlert,
  Lock,
  TrendingDown,
  Wrench,
  Scale,
  Users,
  Gavel,
  FileCheck,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? FileText;
}

export function CategoryGrid({
  onSelectCategory,
}: {
  onSelectCategory: (category: Category) => void;
}) {
  return (
    <section aria-labelledby="categories-heading" className="space-y-4">
      <h2 id="categories-heading" className="text-xl font-bold">
        Choose a topic
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TENANT_RIGHTS_CATEGORIES.map((category) => {
          const Icon = getIcon(category.icon);
          return (
            <Card
              key={category.id}
              className="cursor-pointer transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
              onClick={() => {
                onSelectCategory(category);
                trackTenantRights({ name: "category_selected", categoryId: category.id });
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCategory(category);
                  trackTenantRights({ name: "category_selected", categoryId: category.id });
                }
              }}
              role="button"
              aria-label={`${category.title}: ${category.description}`}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary" aria-hidden>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
