"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Home, User, Loader2, CheckCircle2 } from "lucide-react";

type Preferences = {
  email: boolean;
  inApp: boolean;
  criticalOnly: boolean;
};

export default function TenantSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    email: true,
    inApp: true,
    criticalOnly: false,
  });
  const [homeInfo, setHomeInfo] = useState<{
    propertyAddress?: string;
    unitIdentifier?: string;
    jurisdiction?: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tenant/notifications").then((r) => r.json()),
      fetch("/api/tenant/my-home").then((r) => r.json()),
    ])
      .then(([notifData, homeData]) => {
        if (notifData.preferences) {
          try {
            const p = typeof notifData.preferences === "string"
              ? JSON.parse(notifData.preferences)
              : notifData.preferences;
            setPreferences(p);
          } catch { /* ignore */ }
        }
        if (homeData.linked && homeData.unit) {
          setHomeInfo({
            propertyAddress: homeData.unit.propertyAddress,
            unitIdentifier: homeData.unit.unitIdentifier,
            jurisdiction: homeData.unit.jurisdiction,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/tenant/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        Settings
      </h1>

      {/* Linked Property Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-primary" />
            Linked Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          {homeInfo ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium">{homeInfo.propertyAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{homeInfo.unitIdentifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction</span>
                <span className="font-medium uppercase">{homeInfo.jurisdiction?.replace("_", " ")}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No property linked yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded"
              checked={preferences.email}
              onChange={(e) => setPreferences((p) => ({ ...p, email: e.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">In-app notifications</p>
              <p className="text-xs text-muted-foreground">See alerts in the Messages tab</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded"
              checked={preferences.inApp}
              onChange={(e) => setPreferences((p) => ({ ...p, inApp: e.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">Critical only</p>
              <p className="text-xs text-muted-foreground">Only notify for urgent items (emergencies, deadlines)</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded"
              checked={preferences.criticalOnly}
              onChange={(e) => setPreferences((p) => ({ ...p, criticalOnly: e.target.checked }))}
            />
          </label>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : null}
            {saved ? "Saved!" : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your account is managed by Clerk. Click your profile picture in the header to manage your account settings,
            change your password, or sign out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
