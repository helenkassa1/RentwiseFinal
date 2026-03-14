"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Camera, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const DEFAULT_ROOMS = [
  "Living Room",
  "Kitchen",
  "Bathroom",
  "Bedroom 1",
  "Bedroom 2",
  "Hallway",
  "Closets",
  "Windows",
  "Doors & Locks",
  "Floors",
  "Walls & Ceiling",
  "Appliances",
];

const CONDITIONS = [
  { value: "excellent", label: "Excellent", color: "bg-green-100 text-green-700" },
  { value: "good", label: "Good", color: "bg-blue-100 text-blue-700" },
  { value: "fair", label: "Fair", color: "bg-amber-100 text-amber-700" },
  { value: "damaged", label: "Damaged", color: "bg-red-100 text-red-700" },
];

type RoomEntry = {
  room: string;
  condition: string;
  notes: string;
  photos: string[];
};

export default function TenantInspectionPage() {
  const [inspectionType, setInspectionType] = useState<"move_in" | "move_out">("move_in");
  const [rooms, setRooms] = useState<RoomEntry[]>(
    DEFAULT_ROOMS.map((r) => ({ room: r, condition: "", notes: "", photos: [] })),
  );
  const [saved, setSaved] = useState(false);

  const updateRoom = (index: number, field: keyof RoomEntry, value: string | string[]) => {
    setRooms((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setRooms((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, photos: [...r.photos, reader.result as string] } : r,
            ),
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = () => {
    // Save to localStorage for now
    const key = `rentwise_inspection_${inspectionType}`;
    localStorage.setItem(
      key,
      JSON.stringify({ type: inspectionType, date: new Date().toISOString(), rooms }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const text = rooms
      .filter((r) => r.condition || r.notes)
      .map(
        (r) =>
          `${r.room}\n  Condition: ${r.condition || "Not rated"}\n  Notes: ${r.notes || "None"}\n  Photos: ${r.photos.length}`,
      )
      .join("\n\n");
    const blob = new Blob(
      [`${inspectionType === "move_in" ? "MOVE-IN" : "MOVE-OUT"} INSPECTION CHECKLIST\nDate: ${new Date().toLocaleDateString()}\n${"=".repeat(40)}\n\n${text}`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inspectionType}-inspection-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = rooms.filter((r) => r.condition).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Inspection Checklist
        </h1>
        <p className="text-muted-foreground mt-1">
          Document the condition of your unit room by room with photos.
        </p>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        <Button
          variant={inspectionType === "move_in" ? "default" : "outline"}
          onClick={() => setInspectionType("move_in")}
        >
          Move-In Inspection
        </Button>
        <Button
          variant={inspectionType === "move_out" ? "default" : "outline"}
          onClick={() => setInspectionType("move_out")}
        >
          Move-Out Inspection
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm">
            <span>{completedCount} of {rooms.length} areas rated</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedCount / rooms.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room entries */}
      <div className="space-y-3">
        {rooms.map((room, idx) => (
          <Card key={idx}>
            <CardContent className="py-4 space-y-3">
              <h3 className="font-semibold">{room.room}</h3>

              {/* Condition rating */}
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      room.condition === c.value
                        ? `${c.color} ring-2 ring-offset-1`
                        : "hover:bg-muted"
                    }`}
                    onClick={() => updateRoom(idx, "condition", c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <Input
                placeholder="Notes (scratches, stains, damage details...)"
                value={room.notes}
                onChange={(e) => updateRoom(idx, "notes", e.target.value)}
              />

              {/* Photos */}
              <div className="flex flex-wrap gap-2">
                {room.photos.map((p, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-0.5"
                      onClick={() =>
                        updateRoom(idx, "photos", room.photos.filter((_, pi) => pi !== i))
                      }
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                <label className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(idx, e)}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-4">
        <Button variant="outline" onClick={handleExport} className="flex-1">
          Export as Text
        </Button>
        <Button onClick={handleSave} className="flex-1">
          {saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
          {saved ? "Saved!" : "Save Checklist"}
        </Button>
      </div>
    </div>
  );
}
