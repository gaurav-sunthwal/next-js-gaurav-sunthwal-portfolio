import React, { useState } from "react";
import { useImageCrop, ASPECTS } from "@/app/admin/components/ImageCropper";
import { ExperienceItem } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input, TextArea } from "@/components/Input";

interface ExperienceTabProps {
  experiences: ExperienceItem[];
  loadData: () => Promise<void>;
}

export function ExperienceTab({ experiences, loadData }: ExperienceTabProps) {
  const [editingExperience, setEditingExperience] = useState<Partial<ExperienceItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedExperienceId, setDraggedExperienceId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
    setDraggedExperienceId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const draggedIdStr = e.dataTransfer.getData("text/plain");
    const draggedId = draggedIdStr !== "" ? parseInt(draggedIdStr, 10) : draggedExperienceId;
    if (draggedId === null || draggedId === undefined || draggedId === targetId || isNaN(draggedId)) return;

    const draggedIdx = experiences.findIndex(exp => (exp as any).id === draggedId);
    const targetIdx = experiences.findIndex(exp => (exp as any).id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const updatedExperiences = [...experiences];
    const [draggedExp] = updatedExperiences.splice(draggedIdx, 1);
    updatedExperiences.splice(targetIdx, 0, draggedExp);

    try {
      const ids = updatedExperiences.map(exp => (exp as any).id);
      await fetch("/api/experience/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      await loadData();
    } catch (err) {
      console.error("Failed to save reordered experiences", err);
    } finally {
      setDraggedExperienceId(null);
    }
  };

  // Form helpers
  const [tempTech, setTempTech] = useState("");
  const [tempBullets, setTempBullets] = useState("");

  const resetTempStates = () => {
    setTempTech("");
    setTempBullets("");
  };

  const saveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience) return;
    setIsSaving(true);

    const formattedTech = tempTech ? tempTech.split(",").map((t) => t.trim()).filter(Boolean) : editingExperience.tech || [];
    const formattedBullets = tempBullets ? tempBullets.split("\n").map((b) => b.trim()).filter(Boolean) : editingExperience.bullets || [];

    const updated = {
      ...editingExperience,
      tech: formattedTech,
      bullets: formattedBullets,
    } as ExperienceItem;

    try {
      await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setEditingExperience(null);
      resetTempStates();
    }
  };

  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const { cropper, cropAndUpload, cropExisting } = useImageCrop();
  const logoCrop = { aspects: [ASPECTS.square], title: "Crop company logo" };
  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingExperience) return;
    setIsLogoUploading(true);
    try {
      const [url] = await cropAndUpload([file], logoCrop);
      if (url) setEditingExperience((prev) => (prev ? { ...prev, logo: url } : prev));
      e.target.value = "";
    } catch (err: any) {
      alert("Logo upload failed: " + err.message);
    } finally {
      setIsLogoUploading(false);
    }
  };

  const deleteExperience = async (id: number) => {
    if (!confirm("Delete this experience? This cannot be undone.")) return;
    try {
      await fetch(`/api/experience/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {cropper}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Timeline Experience Listings</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingExperience({});
            resetTempStates();
          }}
          className="flex items-center gap-2 border-none"
        >
          <span className="material-symbols-outlined text-sm">add</span> Add Experience
        </Button>
      </div>

      <div className="space-y-6">
        {experiences.map((exp, idx) => (
          <Card
            key={`${exp.company}-${exp.role}`}
            interactive={false}
            draggable
            onDragStart={(e) => handleDragStart(e, (exp as any).id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, (exp as any).id)}
            className={`p-6 border flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-move transition-all ${
              draggedExperienceId === (exp as any).id
                ? "opacity-40 border-primary border-dashed bg-primary/5"
                : "border-outline-variant/20 hover:border-primary/40 bg-surface-container-lowest shadow-sm hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="text-on-surface-variant/40 hover:text-on-surface transition-colors cursor-grab active:cursor-grabbing self-center" title="Drag to reorder">
                <span className="material-symbols-outlined">drag_indicator</span>
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                  {exp.logo ? (
                    <img src={exp.logo} alt="" className="size-8 rounded-lg border border-border object-cover" />
                  ) : (
                    <span className="size-8 rounded-lg border border-border bg-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                      {exp.company.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-on-surface">{exp.company}</h3>
                  {exp.url && (
                    <a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      website
                    </a>
                  )}
                </div>
                <p className="text-sm font-semibold text-secondary">{exp.role} — <span className="text-xs text-on-surface-variant font-medium">{exp.period}</span></p>
                <ul className="text-xs text-on-surface-variant space-y-1 pt-1 list-disc pl-4">
                  {exp.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 self-end md:self-center">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingExperience(exp);
                  setTempTech(exp.tech.join(", "));
                  setTempBullets(exp.bullets.join("\n"));
                }}
                className="px-4 py-2 text-xs"
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => deleteExperience((exp as any).id)}
                className="px-4 py-2 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Experience Edit Modal */}
      {editingExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card interactive={false} className="w-full max-w-lg bg-surface-container-lowest max-h-[90vh] overflow-y-auto p-8 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">
                {editingExperience.company ? "Edit Experience" : "Create New Experience"}
              </h3>
              <button onClick={() => setEditingExperience(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveExperience} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  required
                  value={editingExperience.company || ""}
                  onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                  placeholder="Terminal 2"
                />
                <Input
                  label="Role Title"
                  required
                  value={editingExperience.role || ""}
                  onChange={(e) => setEditingExperience({ ...editingExperience, role: e.target.value })}
                  placeholder="Full Stack Developer"
                />
              </div>
              <Input
                label="Employment Period (Start – End)"
                required
                value={editingExperience.period || ""}
                onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })}
                placeholder="Sep 2025 – Present"
              />
              <div className="flex gap-2 items-end">
                <Input
                  label="Company Logo URL"
                  value={editingExperience.logo || ""}
                  onChange={(e) => setEditingExperience({ ...editingExperience, logo: e.target.value })}
                  placeholder="https://... (square image works best)"
                />
                <label className="h-10 px-4 rounded-default border border-border bg-background text-on-surface font-semibold text-xs flex items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors shrink-0">
                  {isLogoUploading ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={isLogoUploading} />
                </label>
                {editingExperience.logo && (
                  <button
                    type="button"
                    title="Crop logo"
                    onClick={async () => {
                      const url = await cropExisting(editingExperience.logo!, logoCrop);
                      if (url) setEditingExperience((prev) => (prev ? { ...prev, logo: url } : prev));
                    }}
                    className="group relative size-10 shrink-0 cursor-pointer"
                  >
                    <img src={editingExperience.logo} alt="" className="size-10 rounded-lg border border-border object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[16px]">crop</span>
                    </span>
                  </button>
                )}
              </div>
              <Input
                label="Company Website"
                value={editingExperience.url || ""}
                onChange={(e) => setEditingExperience({ ...editingExperience, url: e.target.value })}
                placeholder="https://company.com"
              />
              <TextArea
                label="Work Bullets (one per line · **bold** · [text](https://site) for a website preview · [text](/projects/id) for a project card)"
                required
                value={tempBullets}
                onChange={(e) => setTempBullets(e.target.value)}
                placeholder="Engineered scalable web ecosystems...&#10;Architected complex state management..."
              />
              <Input
                label="Technologies Used (Comma separated)"
                value={tempTech}
                onChange={(e) => setTempTech(e.target.value)}
                placeholder="Next.js, TypeScript, Redux"
              />
              <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                <Button type="button" variant="secondary" onClick={() => setEditingExperience(null)} className="w-1/2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="w-1/2 border-none">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
