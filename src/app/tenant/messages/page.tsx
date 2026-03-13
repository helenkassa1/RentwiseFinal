"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function TenantMessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Your Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No messages yet. Communications with your landlord or property manager will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
