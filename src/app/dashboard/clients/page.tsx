"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clients</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            Your Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No clients added yet. Property owners you manage will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
