"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

export default function TenantLeasePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lease &amp; Rights</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Your Lease
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            No lease on file yet. Once your landlord links your account, your lease details will appear here.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/lease-review">
                Review a Lease <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tenant-rights">
                Know Your Rights <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
