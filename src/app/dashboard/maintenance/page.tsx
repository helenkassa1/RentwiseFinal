"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Maintenance Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            All Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No maintenance requests at this time. Requests from your tenants will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
