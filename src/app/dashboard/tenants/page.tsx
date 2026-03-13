"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tenants</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Your Tenants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tenants added yet. Tenants will appear here once they are linked to your properties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
