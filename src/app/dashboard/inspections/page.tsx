"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function InspectionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inspections</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            Scheduled Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No inspections scheduled. You can schedule move-in, move-out, and routine inspections here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
