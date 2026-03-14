"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Plus,
  X,
  Camera,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Scale,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC / Heating",
  "Appliance",
  "Pest Control",
  "Structural",
  "Lock / Security",
  "Water Damage",
  "Mold",
  "Other",
];

const URGENCY_OPTIONS = [
  { value: "emergency", label: "🚨 Emergency", desc: "Immediate danger or no water/heat/electricity" },
  { value: "urgent", label: "⚠️ Urgent", desc: "Affects habitability but not immediately dangerous" },
  { value: "routine", label: "🔧 Routine", desc: "Non-urgent repair or improvement" },
];

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted", icon: Clock },
  { key: "acknowledged", label: "Acknowledged", icon: CheckCircle2 },
  { key: "scheduled", label: "Scheduled", icon: Clock },
  { key: "in_progress", label: "In Progress", icon: Wrench },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

type MaintenanceRequest = {
  id: string;
  category: string;
  description: string;
  urgency: string;
  status: string;
  photos: string;
  createdAt: string;
  legalDeadlineDate: string | null;
  legalCitation: string | null;
  legalHours: number | null;
};

export default function TenantRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/tenant/maintenance")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!category || !description) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tenant/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, urgency, photos }),
      });
      const data = await res.json();
      if (res.ok && data.request) {
        setRequests((prev) => [data.request, ...prev]);
        setShowForm(false);
        setCategory("");
        setDescription("");
        setUrgency("routine");
        setPhotos([]);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIndex = (status: string) =>
    STATUS_STEPS.findIndex((s) => s.key === status);

  const getTimeRemaining = (deadlineDate: string | null) => {
    if (!deadlineDate) return null;
    const diff = new Date(deadlineDate).getTime() - Date.now();
    if (diff <= 0) return "Overdue";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "New Request"}
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Submit a Maintenance Request</h3>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium mb-2">Urgency *</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`rounded-lg border p-3 text-left text-sm transition-all ${
                      urgency === opt.value
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setUrgency(opt.value)}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                placeholder="Describe the issue in detail. Include when it started and how it affects your living conditions."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Photos (optional)</label>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={photo} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-xs mt-1">Add</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <Button
              className="w-full"
              disabled={!category || !description || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Request
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && requests.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold">No maintenance requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click &quot;New Request&quot; to report an issue to your landlord.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusIdx = getStatusIndex(req.status);
            const isExpanded = expandedId === req.id;
            const timeRemaining = getTimeRemaining(req.legalDeadlineDate);
            const isOverdue = timeRemaining === "Overdue";

            return (
              <Card key={req.id} className={isOverdue ? "border-red-200" : ""}>
                <CardContent className="py-4">
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{req.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            req.urgency === "emergency"
                              ? "bg-red-100 text-red-700"
                              : req.urgency === "urgent"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }`}>
                            {req.urgency}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            req.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {req.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {req.description}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {/* Full description */}
                      <p className="text-sm">{req.description}</p>

                      {/* Status timeline */}
                      <div>
                        <p className="text-sm font-medium mb-2">Status</p>
                        <div className="flex items-center gap-1">
                          {STATUS_STEPS.map((step, i) => {
                            const StepIcon = step.icon;
                            const isCompleted = i <= statusIdx;
                            const isCurrent = i === statusIdx;
                            return (
                              <div key={step.key} className="flex items-center">
                                <div className={`flex items-center gap-1 text-xs ${
                                  isCurrent ? "text-primary font-semibold" : isCompleted ? "text-green-600" : "text-muted-foreground"
                                }`}>
                                  <StepIcon className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">{step.label}</span>
                                </div>
                                {i < STATUS_STEPS.length - 1 && (
                                  <div className={`w-6 h-0.5 mx-1 ${i < statusIdx ? "bg-green-400" : "bg-gray-200"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legal timeline */}
                      {req.legalCitation && (
                        <div className={`rounded-lg p-3 text-sm ${isOverdue ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
                          <div className="flex items-start gap-2">
                            <Scale className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium">
                                {isOverdue ? (
                                  <span className="text-red-700">⚠️ Response deadline has passed</span>
                                ) : (
                                  <span className="text-amber-700">Legal response deadline: {timeRemaining}</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{req.legalCitation}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Photos */}
                      {(() => {
                        const parsedPhotos = (() => {
                          try { return JSON.parse(req.photos); } catch { return []; }
                        })();
                        if (parsedPhotos.length === 0) return null;
                        return (
                          <div>
                            <p className="text-sm font-medium mb-2">Photos</p>
                            <div className="flex flex-wrap gap-2">
                              {parsedPhotos.map((photo: string, i: number) => (
                                <img key={i} src={photo} alt={`Photo ${i + 1}`} className="w-20 h-20 rounded-lg object-cover border" />
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(req.createdAt).toLocaleDateString()} at{" "}
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
