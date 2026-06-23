import React, { useState } from "react";
import { ProjectItem } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Input, TextArea } from "@/components/Input";

interface ProjectsTabProps {
  projects: ProjectItem[];
  loadData: () => Promise<void>;
}

export function ProjectsTab({ projects, loadData }: ProjectsTabProps) {
  // Modal / Form States
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  // Drag and drop sorting states
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [draggedScreenshotIdx, setDraggedScreenshotIdx] = useState<number | null>(null);

  // Temp form states
  const [tempTags, setTempTags] = useState("");
  const [tempMediaUrl, setTempMediaUrl] = useState("");

  const resetTempStates = () => {
    setTempTags("");
    setTempMediaUrl("");
  };

  const handleAddMediaUrl = () => {
    if (!tempMediaUrl.trim() || !editingProject) return;
    const urls = tempMediaUrl
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter(Boolean);

    const currentScreenshots = [...(editingProject.screenshots || [])];
    setEditingProject({
      ...editingProject,
      screenshots: [...currentScreenshots, ...urls],
    });
    setTempMediaUrl("");
  };

  const handleScreenshotDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedScreenshotIdx(index);
  };

  const handleScreenshotDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleScreenshotDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedIdxStr = e.dataTransfer.getData("text/plain");
    const draggedIdx = draggedIdxStr !== "" ? parseInt(draggedIdxStr, 10) : draggedScreenshotIdx;
    if (draggedIdx === null || draggedIdx === undefined || draggedIdx === targetIndex || isNaN(draggedIdx)) return;

    if (!editingProject || !editingProject.screenshots) return;

    const updatedScreenshots = [...editingProject.screenshots];
    const [draggedItem] = updatedScreenshots.splice(draggedIdx, 1);
    updatedScreenshots.splice(targetIndex, 0, draggedItem);

    setEditingProject({
      ...editingProject,
      screenshots: updatedScreenshots,
    });
    setDraggedScreenshotIdx(null);
  };

  const handleProjectDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedProjectId(id);
  };

  const handleProjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProjectDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain") || draggedProjectId;
    if (!draggedId || draggedId === targetId) return;

    const draggedIdx = projects.findIndex(p => p.id === draggedId);
    const targetIdx = projects.findIndex(p => p.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const updatedProjects = [...projects];
    const [draggedProject] = updatedProjects.splice(draggedIdx, 1);
    updatedProjects.splice(targetIdx, 0, draggedProject);

    try {
      const ids = updatedProjects.map(p => p.id);
      await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      await loadData();
    } catch (err) {
      console.error("Failed to save reordered projects", err);
    } finally {
      setDraggedProjectId(null);
    }
  };

  const uploadFileWithProgress = (file: File, onProgress: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.open("POST", "/api/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.url) resolve(res.url);
            else reject(new Error(res.error || "Upload failed"));
          } catch {
            reject(new Error("Invalid response"));
          }
        } else {
          reject(new Error(`Status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  };

  const uploadFiles = async (files: FileList) => {
    if (files.length === 0 || !editingProject) return;

    setIsUploading(true);
    setUploadProgress(0);
    const uploadedScreenshots = [...(editingProject.screenshots || [])];
    let coverUrl = editingProject.image || "";

    const totalFiles = files.length;
    const fileProgresses = new Array(totalFiles).fill(0);

    try {
      for (let i = 0; i < totalFiles; i++) {
        const url = await uploadFileWithProgress(files[i], (percent) => {
          fileProgresses[i] = percent;
          const averageProgress = Math.round(
            fileProgresses.reduce((sum, p) => sum + p, 0) / totalFiles
          );
          setUploadProgress(averageProgress);
        });

        if (i === 0 && !editingProject.image) {
          coverUrl = url;
        } else {
          uploadedScreenshots.push(url);
        }
      }
      
      setEditingProject({
        ...editingProject,
        image: coverUrl,
        screenshots: uploadedScreenshots
      });
    } catch (err) {
      console.error(err);
      alert("Error uploading files");
    } finally {
      setIsUploading(false);
      setIsDragging(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const removeScreenshot = (indexToRemove: number) => {
    if (!editingProject) return;
    const screenshots = (editingProject.screenshots || []).filter((_, idx) => idx !== indexToRemove);
    setEditingProject({ ...editingProject, screenshots });
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingProject) return;
    const file = e.target.files[0];
    
    setIsLogoUploading(true);
    try {
      const url = await uploadFileWithProgress(file, () => {});
      setEditingProject({
        ...editingProject,
        image: url,
      });
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Error uploading logo image");
    } finally {
      setIsLogoUploading(false);
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSaving(true);

    const formattedTags = tempTags 
      ? tempTags.split(",").map((t) => t.replace(/['"]+/g, "").trim()).filter(Boolean) 
      : (editingProject.tags || []).map((t) => t.replace(/['"]+/g, "").trim());
    
    const links = [...(editingProject.links || [])];
    
    const demoIdx = links.findIndex(l => l.label.toLowerCase().includes("demo") || l.label.toLowerCase().includes("live"));
    const demoHref = editingProject.demoUrl || "#";
    if (demoIdx !== -1) {
      links[demoIdx] = { ...links[demoIdx], href: demoHref };
    } else {
      links.unshift({ label: "Live Demo", href: demoHref, icon: "play_circle" });
    }

    const gitIdx = links.findIndex(l => l.label.toLowerCase().includes("source") || l.label.toLowerCase().includes("github") || l.label.toLowerCase().includes("code"));
    const githubHref = (editingProject as any).githubUrl || "#";
    if (gitIdx !== -1) {
      links[gitIdx] = { ...links[gitIdx], href: githubHref };
    } else {
      links.push({ label: "Source Code", href: githubHref, icon: "code" });
    }

    const updated = {
      ...editingProject,
      tags: formattedTags,
      demoUrl: demoHref,
      links: links
    } as ProjectItem;

    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setEditingProject(null);
      resetTempStates();
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Projects Grid Listing</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Drag and drop cards to rearrange projects. The top 2 will be shown on the home page.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingProject({});
            resetTempStates();
          }}
          className="flex items-center gap-2 border-none self-start"
        >
          <span className="material-symbols-outlined text-sm">add</span> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <Card 
            key={project.id} 
            interactive={false} 
            draggable
            onDragStart={(e) => handleProjectDragStart(e, project.id)}
            onDragOver={handleProjectDragOver}
            onDrop={(e) => handleProjectDrop(e, project.id)}
            className={`p-6 flex flex-col justify-between border transition-all cursor-move ${
              draggedProjectId === project.id 
                ? "opacity-40 border-primary border-dashed bg-primary/5" 
                : "border-outline-variant/20 hover:border-primary/40 bg-surface-container-lowest shadow-sm hover:shadow-md"
            }`}
          >
            <div>
              <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-surface-dim relative group">
                {project.image && [".mp4", ".mov", ".webm", ".ogg", ".m4v"].some(ext => project.image.toLowerCase().endsWith(ext) || project.image.toLowerCase().includes("video")) ? (
                  <video src={project.image} className="w-full h-full object-cover" muted loop playsInline />
                ) : (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm ${
                    idx < 2 
                      ? "bg-emerald-500/95 text-white border border-emerald-400/20" 
                      : "bg-surface-container-high/90 text-on-surface border border-outline-variant/30"
                  }`}>
                    {idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`} {idx < 2 && "• Homepage"}
                  </span>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors shadow-sm" title="Drag to reorder">
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full uppercase">
                  {project.type}
                </span>
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[70%]">
                  {project.tags.slice(0, 3).map((t) => (
                    <Chip key={t} active={false} className="py-0.5 px-2 text-[10px] cursor-default border-none bg-surface-container-low pointer-events-none">
                      {t}
                    </Chip>
                  ))}
                  {project.tags.length > 3 && (
                    <Chip key="more" active={false} className="py-0.5 px-2 text-[10px] cursor-default border-none bg-surface-container-low pointer-events-none">
                      + {project.tags.length - 3}
                    </Chip>
                  )}
                </div>
              </div>
              <h3 className="font-title-md text-title-md font-bold mb-2">{project.title}</h3>
              <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">{project.description}</p>
            </div>
            <div className="flex gap-3 pt-6 border-t border-outline-variant/10 mt-6 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  const githubLink = project.links?.find(l => l.label.toLowerCase().includes("source") || l.label.toLowerCase().includes("github") || l.label.toLowerCase().includes("code"))?.href || "";
                  setEditingProject({
                    ...project,
                    githubUrl: githubLink
                  } as any);
                  setTempTags(project.tags.join(", "));
                }}
                className="px-4 py-2 text-xs"
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => deleteProject(project.id)}
                className="px-4 py-2 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <Card interactive={false} className="w-full max-w-4xl bg-surface-container-lowest max-h-[90vh] overflow-y-auto p-8 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">
                {editingProject.id ? "Edit Project Details" : "Create New Project"}
              </h3>
              <button onClick={() => setEditingProject(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveProject} className="space-y-6">
              <Input
                label="Project Title"
                required
                value={editingProject.title || ""}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                placeholder="CourseCrafter AI"
              />
              <Input
                label="Unique Project ID"
                required
                disabled={!!editingProject.id}
                value={editingProject.id || ""}
                onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="coursecrafter-ai"
              />
              <TextArea
                label="Project Description"
                required
                value={editingProject.description || ""}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                placeholder="Describe your project here..."
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-end">
                  <Input
                    label="Logo URL"
                    required
                    value={editingProject.image || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-grow"
                  />
                  <label 
                    htmlFor="logo-file-upload" 
                    className="h-12 px-4 rounded-default border border-[#bdc9c94d] bg-white text-secondary font-semibold text-xs flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors shrink-0"
                  >
                    {isLogoUploading ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span>Upload Logo</span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-file-upload"
                    className="hidden"
                    onChange={handleLogoSelect}
                    disabled={isLogoUploading}
                  />
                </div>
                {editingProject.image && (
                  <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/30">
                    {(() => {
                      const imgUrl = editingProject.image;
                      const isVideo = imgUrl && [".mp4", ".mov", ".webm", ".ogg", ".m4v"].some(ext => imgUrl.toLowerCase().endsWith(ext) || imgUrl.toLowerCase().includes("video"));
                      return isVideo ? (
                        <video src={editingProject.image} className="w-full h-full object-cover" muted loop playsInline />
                      ) : (
                        <img src={editingProject.image} alt="Preview" className="w-full h-full object-cover" />
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Unified Drag & Drop Upload Zone */}
              <div className="flex flex-col gap-2 border-t border-outline-variant/10 pt-4">
                <label className="font-geist text-xs font-semibold uppercase tracking-wider text-[#717171]">
                  Upload Media & Screenshots
                </label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragging ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">upload_file</span>
                  <p className="text-xs font-semibold text-on-surface">Drag & drop files here, or</p>
                  <label htmlFor="unified-file-upload" className="text-xs text-primary font-bold cursor-pointer hover:underline inline-block mt-1">
                    browse from device
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    id="unified-file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <p className="text-[10px] text-on-surface-variant mt-2">
                    First file sets Cover Image. Remaining files are added to Screenshots.
                  </p>
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="material-symbols-outlined animate-spin text-primary text-sm">sync</span>
                      <span className="text-xs text-primary font-semibold">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* External Media URLs */}
              <div className="flex flex-col gap-2 border-t border-outline-variant/10 pt-4">
                <div className="flex gap-2 items-end">
                  <Input
                    label="Add Media by URL"
                    value={tempMediaUrl}
                    onChange={(e) => setTempMediaUrl(e.target.value)}
                    placeholder="Paste image/video URLs (comma-separated or line-breaks)"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMediaUrl}
                    className="h-12 px-4 shrink-0"
                  >
                    Add URL
                  </Button>
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  You can paste multiple URLs separated by commas or lines to add them instantly.
                </p>
              </div>

              {/* Screenshots Previews */}
              {editingProject.screenshots && editingProject.screenshots.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-outline-variant/10 pt-4">
                  <label className="font-geist text-xs font-semibold uppercase tracking-wider text-[#717171]">
                    Project Screenshots / Videos ({editingProject.screenshots.length})
                  </label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {editingProject.screenshots.map((screenshot, idx) => {
                      const isVideo = screenshot && [".mp4", ".mov", ".webm", ".ogg", ".m4v"].some(ext => screenshot.toLowerCase().endsWith(ext) || screenshot.toLowerCase().includes("video"));
                      return (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleScreenshotDragStart(e, idx)}
                          onDragOver={handleScreenshotDragOver}
                          onDrop={(e) => handleScreenshotDrop(e, idx)}
                          className="relative aspect-[9/16] rounded-lg overflow-hidden border border-outline-variant/30 group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all"
                          title="Drag to reorder"
                        >
                          {isVideo ? (
                            <video src={screenshot} className="w-full h-full object-cover pointer-events-none" muted loop playsInline />
                          ) : (
                            <img src={screenshot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeScreenshot(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 text-white flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Input
                label="Tags (Comma separated)"
                value={tempTags}
                onChange={(e) => setTempTags(e.target.value)}
                placeholder="Next.js, Tailwind, Gemini AI"
              />
              <Input
                label="Website Link (Live Demo)"
                value={editingProject.demoUrl || ""}
                onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                placeholder="https://yourdemo.com"
              />
              <Input
                label="Source Code Link (GitHub)"
                value={(editingProject as any).githubUrl || ""}
                onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value } as any)}
                placeholder="https://github.com/..."
              />
              <div className="flex flex-col gap-2">
                <label className="font-geist text-xs font-semibold uppercase tracking-wider text-[#717171]">
                  Project Category
                </label>
                <select
                  className="w-full px-4 h-12 bg-[#F7F7F7] border-2 border-transparent rounded-default font-geist text-sm text-[#222222] focus:outline-none focus:border-primary"
                  value={editingProject.type || "web"}
                  onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value as "web" | "app" })}
                >
                  <option value="web">Web Application</option>
                  <option value="app">Mobile Application</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                <Button type="button" variant="secondary" onClick={() => setEditingProject(null)} className="w-1/2">
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
