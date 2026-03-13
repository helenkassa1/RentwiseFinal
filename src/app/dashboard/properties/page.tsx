"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Your Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No properties added yet. Click &quot;Add Property&quot; to get started with managing your rental units.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
