"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
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
  DEFAULT_HOMEPAGE_TEXTS,
} from "@/lib/data";

// Import modular sub-page tab components
import { OverviewTab } from "@/app/admin/components/OverviewTab";
import { ProjectsTab } from "@/app/admin/components/ProjectsTab";
import { ExperienceTab } from "@/app/admin/components/ExperienceTab";
import { SkillsTab } from "@/app/admin/components/SkillsTab";
import { ReviewsTab } from "@/app/admin/components/ReviewsTab";
import { UsersTab } from "@/app/admin/components/UsersTab";
import { AIAssistantTab } from "@/app/admin/components/AIAssistantTab";
import { FilesTab } from "@/app/admin/components/FilesTab";

type TabType = "overview" | "projects" | "experience" | "skills" | "reviews" | "users" | "agent" | "files";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authUsername, setAuthUsername] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // User accounts list
  const [usersList, setUsersList] = useState<{ id: number; username: string; createdAt: string }[]>([]);

  // Database-synced content states
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certs, setCerts] = useState<CertificationItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [aiSpecs, setAiSpecs] = useState<{ id?: number; name: string }[]>(initialAi.map(s => ({ name: s })));
  const [databases, setDatabases] = useState<{ id?: number; name: string }[]>(initialDbs.map(s => ({ name: s })));
  const [isLoading, setIsLoading] = useState(true);

  // Resume settings states
  const [resumeUrl, setResumeUrl] = useState("");
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);

  // Homepage hero settings states
  const [heroTitle, setHeroTitle] = useState("");
  const [heroTitleHighlight, setHeroTitleHighlight] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [isSavingTexts, setIsSavingTexts] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");

  // Fetch registered users list
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && activeTab === "users") {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

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

  // Fetch all database contents (runs on auth and mutation refresh)
  const loadData = React.useCallback(async () => {
    if (!isAuthenticated) return;
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

      // Fetch Settings / Resume / Homepage Texts
      const resSettings = await fetch("/api/settings");
      if (resSettings.ok) {
        const settingsData = await resSettings.json();
        if (settingsData) {
          if (settingsData.resume_url) {
            setResumeUrl(settingsData.resume_url);
          }
          setHeroTitle(settingsData.hero_title || DEFAULT_HOMEPAGE_TEXTS.hero_title);
          setHeroTitleHighlight(settingsData.hero_title_highlight || DEFAULT_HOMEPAGE_TEXTS.hero_title_highlight);
          setHeroDescription(settingsData.hero_description || DEFAULT_HOMEPAGE_TEXTS.hero_description);
          setGeminiApiKey(settingsData.gemini_api_key || "");
        }
      }

    } catch (err) {
      console.error("Failed loading data from API", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth actions
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

  // Helper function for resume uploading
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsResumeUploading(true);
    setResumeUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.open("POST", "/api/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setResumeUploadProgress(percentComplete);
        }
      };

      const url: string = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res.url);
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setResumeUrl(url);

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

  const handleSaveTexts = async (title: string, highlight: string, description: string) => {
    setIsSavingTexts(true);
    try {
      const resTitle = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hero_title", value: title }),
      });
      const resHighlight = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hero_title_highlight", value: highlight }),
      });
      const resDesc = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hero_description", value: description }),
      });
      if (resTitle.ok && resHighlight.ok && resDesc.ok) {
        alert("Homepage settings updated successfully!");
        loadData();
      } else {
        alert("Failed to save homepage settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings.");
    } finally {
      setIsSavingTexts(false);
    }
  };

  // Rendering Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            Initializing Session...
          </p>
        </div>
      </div>
    );
  }

  // Rendering Login Form
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-surface-container flex items-center justify-center p-4">
        <Card interactive={false} className="w-full max-w-md bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl rounded-2xl">
          <header className="text-center mb-8">
            <span className="material-symbols-outlined text-primary text-5xl mb-2">admin_panel_settings</span>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Portfolio Studio</h1>
            <p className="text-xs text-on-surface-variant mt-1.5 uppercase tracking-widest font-semibold">
              Authorized Access Only
            </p>
          </header>

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
              placeholder="Enter your username"
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
              className="w-full py-4 h-auto rounded-xl font-bold border-none flex justify-center items-center gap-2 cursor-pointer"
            >
              {isAuthLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex flex-col md:flex-row font-geist">
      {/* Sidebar Control Panel */}
      <aside className="w-full md:w-64 bg-surface-container-lowest border-r border-divider p-6 flex flex-col gap-8 shrink-0 md:h-screen md:sticky md:top-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-on-surface">{authUsername}</h2>
            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full uppercase">
              Admin
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant">Portfolio Studio Control</p>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {(["overview", "projects", "experience", "skills", "reviews", "users", "agent", "files"] as TabType[]).map((tab) => {
            let icon = "dashboard";
            if (tab === "projects") icon = "grid_view";
            if (tab === "experience") icon = "work";
            if (tab === "skills") icon = "terminal";
            if (tab === "reviews") icon = "forum";
            if (tab === "users") icon = "group";
            if (tab === "agent") icon = "smart_toy";
            if (tab === "files") icon = "folder";

            const label =
              tab === "skills"
                ? "Skills & Education"
                : tab === "users"
                ? "User Management"
                : tab === "agent"
                ? "AI Assistant"
                : tab === "files"
                ? "Files Manager"
                : tab;

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
              Manage Portfolio{" "}
              <span className="gradient-text bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                Content
              </span>
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

        {/* Tab Contents loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
              <p className="text-xs font-semibold text-on-surface-variant">Syncing records...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                projectsCount={projects.length}
                experiencesCount={experiences.length}
                skillsCount={skills.length}
                reviewsCount={testimonials.length}
                resumeUrl={resumeUrl}
                isResumeUploading={isResumeUploading}
                resumeUploadProgress={resumeUploadProgress}
                handleResumeUpload={handleResumeUpload}
                setActiveTab={setActiveTab}
                heroTitle={heroTitle}
                setHeroTitle={setHeroTitle}
                heroTitleHighlight={heroTitleHighlight}
                setHeroTitleHighlight={setHeroTitleHighlight}
                heroDescription={heroDescription}
                setHeroDescription={setHeroDescription}
                isSavingTexts={isSavingTexts}
                handleSaveTexts={handleSaveTexts}
                geminiApiKey={geminiApiKey}
                setGeminiApiKey={setGeminiApiKey}
              />
            )}

            {activeTab === "projects" && <ProjectsTab projects={projects} loadData={loadData} />}

            {activeTab === "experience" && <ExperienceTab experiences={experiences} loadData={loadData} />}

            {activeTab === "skills" && (
              <SkillsTab
                skills={skills}
                education={education}
                certs={certs}
                aiSpecs={aiSpecs}
                databases={databases}
                loadData={loadData}
              />
            )}

            {activeTab === "reviews" && <ReviewsTab testimonials={testimonials} loadData={loadData} />}

            {activeTab === "users" && <UsersTab usersList={usersList} fetchUsers={fetchUsers} />}

            {activeTab === "files" && <FilesTab />}
          </>
        )}

        <AIAssistantTab active={activeTab === "agent"} onMutation={loadData} floating={activeTab !== "agent"} />
      </main>
    </div>
  );
}
