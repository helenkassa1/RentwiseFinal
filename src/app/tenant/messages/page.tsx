"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell, CheckCircle2, AlertCircle, DollarSign, Key, FileText, Loader2 } from "lucide-react";

type NoticeItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: unknown;
  isRead: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  compliance_deadline: AlertCircle,
  lease_expiration: FileText,
  maintenance_escalation: AlertCircle,
  rent_increase: DollarSign,
  general: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  compliance_deadline: "bg-amber-100 text-amber-700",
  lease_expiration: "bg-blue-100 text-blue-700",
  maintenance_escalation: "bg-red-100 text-red-700",
  rent_increase: "bg-purple-100 text-purple-700",
  general: "bg-gray-100 text-gray-700",
};

export default function TenantMessagesPage() {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    fetch("/api/tenant/notifications")
      .then((res) => res.json())
      .then((data) => setNotices(data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    await fetch("/api/tenant/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true, notificationId: id }),
    }).catch(() => {});
  };

  const unreadCount = notices.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Messages &amp; Notices
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Notifications from your landlord, system alerts, and important notices.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && notices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Notifications about rent, maintenance, lease updates, and landlord messages will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && notices.length > 0 && (
        <div className="space-y-3">
          {notices.map((notice) => {
            const Icon = TYPE_ICONS[notice.type] ?? Bell;
            const colorClass = TYPE_COLORS[notice.type] ?? TYPE_COLORS.general;

            return (
              <Card
                key={notice.id}
                className={`transition-colors ${!notice.isRead ? "border-primary/30 bg-primary/5" : ""}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 rounded-full p-2 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notice.isRead ? "font-semibold" : "font-medium"}`}>
                            {notice.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notice.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!notice.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => markAsRead(notice.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
