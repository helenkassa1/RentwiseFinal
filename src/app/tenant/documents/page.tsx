"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Camera, X, Download, Calendar, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";

type DocEntry = {
  id: string;
  date: string;
  category: "maintenance" | "communication" | "condition" | "other";
  description: string;
  photos: string[];
  createdAt: string;
};

const CATEGORIES = [
  { value: "maintenance", label: "Maintenance Issue", color: "bg-orange-100 text-orange-700" },
  { value: "communication", label: "Communication", color: "bg-blue-100 text-blue-700" },
  { value: "condition", label: "Property Condition", color: "bg-green-100 text-green-700" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-700" },
];

export default function TenantDocumentsPage() {
  const [entries, setEntries] = useState<DocEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rentwise_docs");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<DocEntry["category"]>("maintenance");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (newEntries: DocEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("rentwise_docs", JSON.stringify(newEntries));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAdd = () => {
    if (!description.trim()) return;
    const entry: DocEntry = {
      id: crypto.randomUUID(),
      date,
      category,
      description: description.trim(),
      photos,
      createdAt: new Date().toISOString(),
    };
    save([entry, ...entries]);
    setShowForm(false);
    setDescription("");
    setPhotos([]);
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleExport = () => {
    const text = entries
      .map(
        (e) =>
          `[${e.date}] ${e.category.toUpperCase()}\n${e.description}\n${e.photos.length > 0 ? `(${e.photos.length} photo(s) attached)\n` : ""}`,
      )
      .join("\n---\n\n");
    const blob = new Blob(
      [`ISSUE DOCUMENTATION LOG\nExported ${new Date().toLocaleDateString()}\n${"=".repeat(40)}\n\n${text}`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rentwise-documentation-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Issue Documentation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Keep a timestamped record of issues, communications, and conditions. This log can be exported for legal proceedings.
          </p>
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Cancel" : "Add Entry"}
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocEntry["category"])}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                placeholder="Describe what happened, what you observed, or what was communicated..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photos</label>
              <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-0.5"
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  className="w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </div>
            <Button onClick={handleAdd} disabled={!description.trim()} className="w-full">
              Save Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {entries.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold">No documentation yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start logging issues, communications, and conditions to protect your rights.
            </p>
          </CardContent>
        </Card>
      )}

      {entries.map((entry) => {
        const catInfo = CATEGORIES.find((c) => c.value === entry.category);
        return (
          <Card key={entry.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{entry.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${catInfo?.color ?? ""}`}>
                    {catInfo?.label ?? entry.category}
                  </span>
                </div>
                <button
                  className="text-xs text-muted-foreground hover:text-red-600"
                  onClick={() => save(entries.filter((e) => e.id !== entry.id))}
                >
                  Remove
                </button>
              </div>
              <p className="text-sm mt-2">{entry.description}</p>
              {entry.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {entry.photos.map((p, i) => (
                    <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
