"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Input, TextArea } from "@/components/Input";
import { ListItem } from "@/components/ListItem";
import {
  PROJECT_ITEMS as initialProjects,
  EXPERIENCE_ITEMS as initialExperience,
  TECHNICAL_CORE as initialSkills,
  AI_SPECIALIZATION as initialAi,
  DATABASES as initialDbs,
  EDUCATION_ITEMS as initialEdu,
  CERTIFICATIONS as initialCerts,
  TESTIMONIALS as initialTestimonials,
  ProjectItem,
  ExperienceItem,
  SkillItem,
  EducationItem,
  CertificationItem,
  TestimonialItem,
} from "@/lib/data";

type TabType = "overview" | "projects" | "experience" | "skills" | "reviews";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Local state representing database-synced data
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [aiSpecs, setAiSpecs] = useState<{id?: number; name: string}[]>(initialAi.map(s => ({name: s})));
  const [databases, setDatabases] = useState<{id?: number; name: string}[]>(initialDbs.map(s => ({name: s})));
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certs, setCerts] = useState<CertificationItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authUsername, setAuthUsername] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Verify authentication on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setAuthUsername(data.username);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch all data from APIs and auto-seed if empty
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch Projects
        const resProj = await fetch("/api/projects");
        let dataProj = await resProj.json();
        if (!Array.isArray(dataProj) || dataProj.length === 0) {
          for (const item of initialProjects) {
            await fetch("/api/projects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
          const fresh = await fetch("/api/projects");
          dataProj = await fresh.json();
        }
        setProjects(dataProj);

        // Fetch Experience
        const resExp = await fetch("/api/experience");
        let dataExp = await resExp.json();
        if (!Array.isArray(dataExp) || dataExp.length === 0) {
          for (const item of initialExperience) {
            await fetch("/api/experience", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
          const fresh = await fetch("/api/experience");
          dataExp = await fresh.json();
        }
        setExperiences(dataExp);

        // Fetch Skills
        const resSkills = await fetch("/api/skills");
        let dataSkills = await resSkills.json();
        if (!Array.isArray(dataSkills) || dataSkills.length === 0) {
          for (const item of initialSkills) {
            await fetch("/api/skills", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
          const fresh = await fetch("/api/skills");
          dataSkills = await fresh.json();
        }
        setSkills(dataSkills);

        // Fetch Education
        const resEdu = await fetch("/api/education");
        let dataEdu = await resEdu.json();
        if (!Array.isArray(dataEdu) || dataEdu.length === 0) {
          for (const item of initialEdu) {
            await fetch("/api/education", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
          const fresh = await fetch("/api/education");
          dataEdu = await fresh.json();
        }
        setEducation(dataEdu);

        // Fetch Certifications
        const resCerts = await fetch("/api/certifications");
        let dataCerts = await resCerts.json();
        if (!Array.isArray(dataCerts) || dataCerts.length === 0) {
          for (const item of initialCerts) {
            await fetch("/api/certifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
          const fresh = await fetch("/api/certifications");
          dataCerts = await fresh.json();
        }
        setCerts(dataCerts);

        // Fetch Testimonials
        const resTest = await fetch("/api/testimonials");
        let dataTest = await resTest.json();
        if (!Array.isArray(dataTest) || dataTest.length === 0) {
          for (const item of initialTestimonials) {
            await fetch("/api/testimonials", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
          const fresh = await fetch("/api/testimonials");
          dataTest = await fresh.json();
        }
        setTestimonials(dataTest);

        // Fetch AI Specialization
        const resAi = await fetch("/api/ai-specialization");
        let dataAi = await resAi.json();
        if (!Array.isArray(dataAi) || dataAi.length === 0) {
          for (const item of initialAi) {
            await fetch("/api/ai-specialization", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: item }),
            });
          }
          const fresh = await fetch("/api/ai-specialization");
          dataAi = await fresh.json();
        }
        setAiSpecs(dataAi);

        // Fetch Databases
        const resDbList = await fetch("/api/databases");
        let dataDbList = await resDbList.json();
        if (!Array.isArray(dataDbList) || dataDbList.length === 0) {
          for (const item of initialDbs) {
            await fetch("/api/databases", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: item }),
            });
          }
          const fresh = await fetch("/api/databases");
          dataDbList = await fresh.json();
        }
        setDatabases(dataDbList);

        // Fetch Settings / Resume
        const resSettings = await fetch("/api/settings?key=resume_url");
        if (resSettings.ok) {
          const settingData = await resSettings.json();
          if (settingData && settingData.value) {
            setResumeUrl(settingData.value);
          }
        }

      } catch (err) {
        console.error("Failed loading data from API", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Modal / Form States
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [editingExperience, setEditingExperience] = useState<Partial<ExperienceItem> | null>(null);
  const [editingSkill, setEditingSkill] = useState<Partial<SkillItem> | null>(null);
  const [editingEdu, setEditingEdu] = useState<Partial<EducationItem> | null>(null);
  const [editingCert, setEditingCert] = useState<Partial<CertificationItem> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);

  // Helpers for tags & lists
  const [tempTags, setTempTags] = useState("");
  const [tempTech, setTempTech] = useState("");
  const [tempBullets, setTempBullets] = useState("");

  const resetTempStates = () => {
    setTempTags("");
    setTempTech("");
    setTempBullets("");
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

    setProjects(updatedProjects);
    setDraggedProjectId(null);

    try {
      const ids = updatedProjects.map(p => p.id);
      await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } catch (err) {
      console.error("Failed to save reordered projects", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsResumeUploading(true);
    setResumeUploadProgress(0);

    try {
      const url = await uploadFileWithProgress(file, (percent) => {
        setResumeUploadProgress(percent);
      });

      // Update resumeUrl state
      setResumeUrl(url);

      // Save to settings table in database
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "resume_url", value: url }),
      });

      if (!res.ok) {
        throw new Error("Failed to save resume URL to settings");
      }

      alert("Resume uploaded and saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error uploading resume: " + err.message);
    } finally {
      setIsResumeUploading(false);
      setResumeUploadProgress(0);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setAuthUsername(loginUser);
      } else {
        setAuthError(data.error || "Login failed");
      }
    } catch (err) {
      setAuthError("An error occurred during login");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsAuthenticated(false);
        setAuthUsername("");
        setLoginUser("");
        setLoginPass("");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // --- CRUD HANDLERS ---
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSaving(true);

    const formattedTags = tempTags ? tempTags.split(",").map((t) => t.trim()).filter(Boolean) : editingProject.tags || [];
    
    // Manage demoUrl and githubUrl inside the links array
    const links = [...(editingProject.links || [])];
    
    // Live Demo link
    const demoIdx = links.findIndex(l => l.label.toLowerCase().includes("demo") || l.label.toLowerCase().includes("live"));
    const demoHref = editingProject.demoUrl || "#";
    if (demoIdx !== -1) {
      links[demoIdx] = { ...links[demoIdx], href: demoHref };
    } else {
      links.unshift({ label: "Live Demo", href: demoHref, icon: "play_circle" });
    }

    // Source Code link
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
      const res = await fetch("/api/projects");
      const list = await res.json();
      setProjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    setEditingProject(null);
    resetTempStates();
  };

  const deleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
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
      const res = await fetch("/api/experience");
      const list = await res.json();
      setExperiences(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    setEditingExperience(null);
    resetTempStates();
  };

  const deleteExperience = async (id: number) => {
    try {
      await fetch(`/api/experience/${id}`, { method: "DELETE" });
      setExperiences(experiences.filter((exp: any) => exp.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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
      const res = await fetch("/api/skills");
      const list = await res.json();
      setSkills(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    setEditingSkill(null);
  };

  const deleteSkill = async (id: number) => {
    try {
      await fetch(`/api/skills/${id}`, { method: "DELETE" });
      setSkills(skills.filter((s: any) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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
      const res = await fetch("/api/education");
      const list = await res.json();
      setEducation(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    setEditingEdu(null);
  };

  const deleteEdu = async (id: number) => {
    try {
      await fetch(`/api/education/${id}`, { method: "DELETE" });
      setEducation(education.filter((edu: any) => edu.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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
      const res = await fetch("/api/certifications");
      const list = await res.json();
      setCerts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    setEditingCert(null);
  };

  const deleteCert = async (id: number) => {
    try {
      await fetch(`/api/certifications/${id}`, { method: "DELETE" });
      setCerts(certs.filter((c: any) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const saveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setIsSaving(true);

    try {
      await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTestimonial),
      });
      const res = await fetch("/api/testimonials");
      const list = await res.json();
      setTestimonials(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    setEditingTestimonial(null);
  };

  const deleteTestimonial = async (id: number) => {
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      setTestimonials(testimonials.filter((t: any) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F9F9F9] min-h-screen flex items-center justify-center p-4">
        <Card interactive={false} className="w-full max-w-md bg-white p-8 border border-outline-variant/30 shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block font-semibold">
              Admin Portal
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              Administrator Login
            </h2>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Enter your credentials to manage your portfolio content.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold text-center">
                {authError}
              </div>
            )}
            <Input
              label="Username"
              required
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="admin"
            />
            <Input
              label="Password"
              required
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              disabled={isAuthLoading}
              variant="primary"
              className="w-full py-4 h-auto rounded-xl font-semibold border-none flex justify-center items-center gap-2"
            >
              {isAuthLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] text-on-surface min-h-screen flex flex-col md:flex-row selection:bg-primary/20 selection:text-primary antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-divider flex flex-col p-6 gap-8 shrink-0 md:h-screen sticky top-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-on-surface">{authUsername}</h2>
            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full uppercase">Admin</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">Portfolio Studio Control</p>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {(["overview", "projects", "experience", "skills", "reviews"] as TabType[]).map((tab) => {
            let icon = "dashboard";
            if (tab === "projects") icon = "grid_view";
            if (tab === "experience") icon = "work";
            if (tab === "skills") icon = "terminal";
            if (tab === "reviews") icon = "forum";

            const label = tab === "skills" ? "Skills & Education" : tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-geist text-sm font-semibold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="pt-4 border-t border-divider flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all font-semibold text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-red-600">logout</span>
            Logout
          </button>
          <Link
            href="/"
            className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-secondary hover:bg-surface-container-low hover:text-on-surface transition-all font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-h-screen">
        {/* Header Title */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block font-semibold">
              Admin Portal
            </span>
            <h1 className="font-display-lg text-display-lg leading-tight tracking-tight">
              Manage Portfolio <span className="gradient-text bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Content</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-xs font-semibold uppercase tracking-wider self-start md:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Local Simulator Sandbox
          </div>
        </header>

        {/* Tab Contents */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">grid_view</span>
                <span className="text-3xl font-extrabold">{projects.length}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Projects</span>
              </Card>
              <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">work</span>
                <span className="text-3xl font-extrabold">{experiences.length}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Timeline Experience</span>
              </Card>
              <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                <span className="text-3xl font-extrabold">{skills.length + aiSpecs.length + databases.length}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Skills & Tools</span>
              </Card>
              <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">forum</span>
                <span className="text-3xl font-extrabold">{testimonials.length}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Partner Reviews</span>
              </Card>
            </div>

            <Card interactive={false} className="p-8 border border-outline-variant/20 bg-surface-container-low flex flex-col gap-4">
              <h3 className="font-title-md text-title-md font-bold">Welcome to your Portfolio Studio</h3>
              <p className="text-on-surface-variant text-sm max-w-2xl leading-relaxed">
                This administration interface operates in local preview mode. Any modifications made here will affect the state of the screens in your active session. Once you are satisfied with the updates, the data configurations can be permanently exported.
              </p>
              <div className="flex gap-4 mt-2">
                <Button variant="primary" onClick={() => setActiveTab("projects")} className="border-none">
                  Manage Projects
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("experience")}>
                  Manage Experience
                </Button>
              </div>
            </Card>

            {/* Resume / CV Management Card */}
            <Card interactive={false} className="p-8 border border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="font-title-md text-title-md font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Resume & CV Settings
                </h3>
                <p className="text-on-surface-variant text-xs">
                  Upload your professional resume or CV. All download buttons across the website will be linked to this file.
                </p>
              </div>

              <div className="flex flex-col gap-4 max-w-xl">
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <input
                      type="text"
                      className="w-full px-4 h-12 bg-surface-container-low border border-outline-variant/30 rounded-default font-geist text-sm text-on-surface focus:outline-none focus:border-primary"
                      value={resumeUrl}
                      readOnly
                      placeholder="No resume uploaded yet"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("resume-file-input")?.click()}
                    disabled={isResumeUploading}
                    className="h-12"
                  >
                    {isResumeUploading ? `Uploading... (${resumeUploadProgress}%)` : "Upload PDF"}
                  </Button>
                  <input
                    type="file"
                    id="resume-file-input"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                </div>

                {resumeUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> Active CV
                    </span>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Preview File <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "projects" && (
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
                      <div className="flex gap-1.5">
                        {project.tags.map((t) => (
                          <Chip key={t} active={false} className="py-0.5 px-2 text-[10px] cursor-default border-none bg-surface-container-low">
                            {t}
                          </Chip>
                        ))}
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
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-8">
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
              {experiences.map((exp) => (
                <Card key={`${exp.company}-${exp.role}`} interactive={false} className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-on-surface">{exp.company}</h3>
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">
                        {exp.badge}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-secondary">{exp.role} — <span className="text-xs text-on-surface-variant font-medium">{exp.period}</span></p>
                    <ul className="text-xs text-on-surface-variant space-y-1 pt-1 list-disc pl-4">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
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
          </div>
        )}

        {activeTab === "skills" && (
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
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Partner Testimonials</h2>
              <Button variant="primary" onClick={() => setEditingTestimonial({})} className="flex items-center gap-2 border-none">
                <span className="material-symbols-outlined text-sm">add</span> Add Review
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test, idx) => (
                <Card key={idx} interactive={false} className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col justify-between">
                  <p className="text-xs text-on-surface-variant italic mb-6 leading-relaxed">"{test.quote}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {test.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{test.role}</h4>
                        <p className="text-[10px] text-on-surface-variant">{test.company}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingTestimonial(test)} className="px-3 py-1.5 text-xs">
                        Edit
                      </Button>
                      <Button variant="secondary" onClick={() => deleteTestimonial((test as any).id)} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white">
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- FORM MODALS --- */}

        {/* Project Edit Modal */}
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <Card interactive={false} className="w-full max-w-lg bg-surface-container-lowest max-h-[90vh] overflow-y-auto p-8 border border-outline-variant/30 shadow-2xl">
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
                  <Input
                    label="Image URL"
                    required
                    value={editingProject.image || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                    placeholder="https://..."
                  />
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
                          <div key={idx} className="relative aspect-[9/16] rounded-lg overflow-hidden border border-outline-variant/30 group">
                            {isVideo ? (
                              <video src={screenshot} className="w-full h-full object-cover" muted loop playsInline />
                            ) : (
                              <img src={screenshot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
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
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

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
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Employment Period"
                    required
                    value={editingExperience.period || ""}
                    onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })}
                    placeholder="Sep 2025 - Present"
                  />
                  <Input
                    label="Badge label"
                    required
                    value={editingExperience.badge || ""}
                    onChange={(e) => setEditingExperience({ ...editingExperience, badge: e.target.value })}
                    placeholder="Current"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-geist text-xs font-semibold uppercase tracking-wider text-[#717171]">
                    Badge Styling Type
                  </label>
                  <select
                    className="w-full px-4 h-12 bg-[#F7F7F7] border-2 border-transparent rounded-default font-geist text-sm text-[#222222] focus:outline-none focus:border-primary"
                    value={editingExperience.badgeType || "primary"}
                    onChange={(e) => setEditingExperience({ ...editingExperience, badgeType: e.target.value as "primary" | "secondary" })}
                  >
                    <option value="primary">Primary (Teal color)</option>
                    <option value="secondary">Secondary (Neutral color)</option>
                  </select>
                </div>
                <TextArea
                  label="Work Bullets (One per line)"
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
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

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
                    Save Changes
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
                    Save Changes
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
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Testimonial Edit Modal */}
        {editingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card interactive={false} className="w-full max-w-md bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-title-md text-title-md font-bold">
                  {editingTestimonial.role ? "Edit Testimonial" : "Create New Testimonial"}
                </h3>
                <button onClick={() => setEditingTestimonial(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={saveTestimonial} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Author Role"
                      required
                      value={editingTestimonial.role || ""}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                      placeholder="CTO"
                    />
                  </div>
                  <div>
                    <Input
                      label="Avatar Letter"
                      required
                      value={editingTestimonial.avatar || ""}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value.substring(0,1).toUpperCase() })}
                      placeholder="T"
                    />
                  </div>
                </div>
                <Input
                  label="Company Name"
                  required
                  value={editingTestimonial.company || ""}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                  placeholder="Terminal 2"
                />
                <TextArea
                  label="Quote Content"
                  required
                  value={editingTestimonial.quote || ""}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  placeholder="Write the review message here..."
                />
                <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                  <Button type="button" variant="secondary" onClick={() => setEditingTestimonial(null)} className="w-1/2">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="w-1/2 border-none">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
