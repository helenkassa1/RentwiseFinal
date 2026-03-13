"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Plus } from "lucide-react";

export default function TenantRequestsPage() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <Button onClick={() => setShowNotice(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>
      {showNotice && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Maintenance request submission is coming soon. We&apos;re building this feature now.
          <button className="ml-2 underline" onClick={() => setShowNotice(false)}>Dismiss</button>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Your Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No maintenance requests submitted. Use the button above to report an issue to your landlord.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
