"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Mail, Phone, Calendar, Loader2 } from "lucide-react";

type TenantRow = {
  tenantId: string;
  tenantName: string | null;
  tenantEmail: string | null;
  tenantPhone: string | null;
  moveInDate: string | null;
  isActive: boolean;
  unitIdentifier: string;
  unitId: string;
  propertyAddress: string;
  propertyName: string | null;
  propertyId: string;
};

export default function TenantsPage() {
  const [loading, setLoading] = useState(true);
  const [tenantList, setTenantList] = useState<TenantRow[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/tenants")
      .then((res) => res.json())
      .then((data) => setTenantList(data.tenants ?? []))
      .catch(() => setTenantList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <span className="text-sm text-muted-foreground">
          {tenantList.length} {tenantList.length === 1 ? "tenant" : "tenants"}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && tenantList.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Your Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No tenants linked yet. Tenants will appear here once they claim a unit
              at one of your properties during sign-up.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && tenantList.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenantList.map((t) => (
            <Card key={t.tenantId} className={!t.isActive ? "opacity-60" : ""}>
              <CardContent className="py-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {t.tenantName || "Unnamed tenant"}
                    </p>
                    {!t.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home className="h-4 w-4 shrink-0" />
                    <span>
                      {t.propertyName || t.propertyAddress} · {t.unitIdentifier}
                    </span>
                  </div>
                  {t.tenantEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{t.tenantEmail}</span>
                    </div>
                  )}
                  {t.tenantPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{t.tenantPhone}</span>
                    </div>
                  )}
                  {t.moveInDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        Moved in {new Date(t.moveInDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
