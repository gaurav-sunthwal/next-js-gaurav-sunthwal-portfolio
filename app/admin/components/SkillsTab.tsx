import React, { useState } from "react";
import { SkillItem, EducationItem, CertificationItem } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";

interface SkillsTabProps {
  skills: SkillItem[];
  education: EducationItem[];
  certs: CertificationItem[];
  aiSpecs: { id?: number; name: string }[];
  databases: { id?: number; name: string }[];
  loadData: () => Promise<void>;
}

export function SkillsTab({
  skills,
  education,
  certs,
  aiSpecs,
  databases,
  loadData,
}: SkillsTabProps) {
  // Modal / Form States
  const [editingSkill, setEditingSkill] = useState<Partial<SkillItem> | null>(null);
  const [editingEdu, setEditingEdu] = useState<Partial<EducationItem> | null>(null);
  const [editingCert, setEditingCert] = useState<Partial<CertificationItem> | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Simple input tags addition states
  const [newAiName, setNewAiName] = useState("");
  const [newDbName, setNewDbName] = useState("");

  // Skills handlers
  const saveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setIsSaving(true);
    try {
      await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSkill),
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setEditingSkill(null);
    }
  };

  const deleteSkill = async (id: number) => {
    try {
      await fetch(`/api/skills/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Education handlers
  const saveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;
    setIsSaving(true);
    try {
      await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEdu),
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setEditingEdu(null);
    }
  };

  const deleteEdu = async (id: number) => {
    try {
      await fetch(`/api/education/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Certifications handlers
  const saveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setIsSaving(true);
    try {
      await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCert),
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setEditingCert(null);
    }
  };

  const deleteCert = async (id: number) => {
    try {
      await fetch(`/api/certifications/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // AI Specialization tags handlers
  const handleAddAiSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAiName.trim()) return;
    try {
      await fetch("/api/ai-specialization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAiName.trim() }),
      });
      setNewAiName("");
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAiSpec = async (id: number) => {
    try {
      await fetch(`/api/ai-specialization/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Database tags handlers
  const handleAddDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;
    try {
      await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDbName.trim() }),
      });
      setNewDbName("");
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDatabase = async (id: number) => {
    try {
      await fetch(`/api/databases/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Technical Core Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Technical Core Languages/Frameworks</h2>
          <Button variant="primary" onClick={() => setEditingSkill({})} className="flex items-center gap-2 border-none">
            <span className="material-symbols-outlined text-sm">add</span> Add Skill
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <Card key={skill.name} interactive={false} className="p-4 border border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-bold text-sm">{skill.name}</span>
                <span className="text-[10px] text-on-surface-variant">{skill.subtitle}</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setEditingSkill(skill)} className="text-secondary hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button onClick={() => deleteSkill((skill as any).id)} className="text-secondary hover:text-red-500 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Education Settings Section */}
      <div className="space-y-6 pt-6 border-t border-divider">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Education History</h2>
          <Button variant="primary" onClick={() => setEditingEdu({})} className="flex items-center gap-2 border-none">
            <span className="material-symbols-outlined text-sm">add</span> Add Education
          </Button>
        </div>
        <div className="space-y-4">
          {education.map((edu) => (
            <Card key={edu.degree} interactive={false} className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface-dim rounded-lg overflow-hidden shrink-0">
                  <img src={edu.image} alt={edu.school} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{edu.degree}</h4>
                  <p className="text-xs text-secondary">{edu.school} — {edu.location}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingEdu(edu)} className="px-4 py-2 text-xs">
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => deleteEdu((edu as any).id)} className="px-4 py-2 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="space-y-6 pt-6 border-t border-divider">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Certifications Grid</h2>
          <Button variant="primary" onClick={() => setEditingCert({})} className="flex items-center gap-2 border-none">
            <span className="material-symbols-outlined text-sm">add</span> Add Certificate
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certs.map((c) => (
            <Card key={c.title} interactive={false} className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">{c.title}</h4>
                <p className="text-xs text-on-surface-variant">{c.subtitle}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => setEditingCert(c)} className="px-3 py-1.5 text-xs">
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => deleteCert((c as any).id)} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI & Databases Specialization Tags Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6 border-t border-divider">
        {/* AI Specialization Tag list */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">AI Specialization Topics</h2>
            <p className="text-[11px] text-on-surface-variant">Topics displayed under AI Specialization expertise.</p>
          </div>
          <form onSubmit={handleAddAiSpec} className="flex gap-2">
            <input
              type="text"
              required
              value={newAiName}
              onChange={(e) => setNewAiName(e.target.value)}
              placeholder="e.g. LLM Finetuning"
              className="flex-grow bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none"
            />
            <Button type="submit" className="px-3 py-2 h-auto text-xs font-bold cursor-pointer">
              Add Tag
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 pt-2">
            {aiSpecs.map((tag) => (
              <span key={tag.id} className="flex items-center gap-1.5 text-xs bg-surface-container text-on-surface border border-outline-variant/20 px-3 py-1.5 rounded-full font-semibold">
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleDeleteAiSpec(tag.id!)}
                  className="text-secondary hover:text-red-500 cursor-pointer flex items-center"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Databases List */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Database Skills</h2>
            <p className="text-[11px] text-on-surface-variant">Databases displayed under Database Specialization expertise.</p>
          </div>
          <form onSubmit={handleAddDatabase} className="flex gap-2">
            <input
              type="text"
              required
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              placeholder="e.g. Redis"
              className="flex-grow bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none"
            />
            <Button type="submit" className="px-3 py-2 h-auto text-xs font-bold cursor-pointer">
              Add Tag
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 pt-2">
            {databases.map((tag) => (
              <span key={tag.id} className="flex items-center gap-1.5 text-xs bg-surface-container text-on-surface border border-outline-variant/20 px-3 py-1.5 rounded-full font-semibold">
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleDeleteDatabase(tag.id!)}
                  className="text-secondary hover:text-red-500 cursor-pointer flex items-center"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* Skill Edit Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card interactive={false} className="w-full max-w-sm bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">
                {editingSkill.name ? "Edit Skill" : "Create New Skill"}
              </h3>
              <button onClick={() => setEditingSkill(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveSkill} className="space-y-6">
              <Input
                label="Skill Name"
                required
                value={editingSkill.name || ""}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                placeholder="Next.js"
              />
              <Input
                label="Subtitle Description"
                required
                value={editingSkill.subtitle || ""}
                onChange={(e) => setEditingSkill({ ...editingSkill, subtitle: e.target.value })}
                placeholder="Fullstack Framework"
              />
              <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                <Button type="button" variant="secondary" onClick={() => setEditingSkill(null)} className="w-1/2">
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

      {/* Education Edit Modal */}
      {editingEdu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card interactive={false} className="w-full max-w-md bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">
                {editingEdu.degree ? "Edit Education" : "Create New Education"}
              </h3>
              <button onClick={() => setEditingEdu(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveEdu} className="space-y-6">
              <Input
                label="Degree Title"
                required
                value={editingEdu.degree || ""}
                onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                placeholder="Bachelor of Technology"
              />
              <Input
                label="School Name"
                required
                value={editingEdu.school || ""}
                onChange={(e) => setEditingEdu({ ...editingEdu, school: e.target.value })}
                placeholder="MIT World Peace University"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Location"
                  required
                  value={editingEdu.location || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, location: e.target.value })}
                  placeholder="Pune, India"
                />
                <Input
                  label="Image URL"
                  required
                  value={editingEdu.image || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                <Button type="button" variant="secondary" onClick={() => setEditingEdu(null)} className="w-1/2">
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

      {/* Certification Edit Modal */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card interactive={false} className="w-full max-w-sm bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">
                {editingCert.title ? "Edit Certification" : "Create New Certification"}
              </h3>
              <button onClick={() => setEditingCert(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveCert} className="space-y-6">
              <Input
                label="Certificate Name"
                required
                value={editingCert.title || ""}
                onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                placeholder="The Complete JavaScript Course"
              />
              <Input
                label="Subtitle/Issuer"
                required
                value={editingCert.subtitle || ""}
                onChange={(e) => setEditingCert({ ...editingCert, subtitle: e.target.value })}
                placeholder="Advanced Logic & Patterns"
              />
              <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                <Button type="button" variant="secondary" onClick={() => setEditingCert(null)} className="w-1/2">
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
