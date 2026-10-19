"use client";

import React, { useCallback, useEffect, useState } from "react";
import { uploadFile } from "@/lib/upload-client";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import type {
  ProjectItem,
  ExperienceItem,
  SkillItem,
  EducationItem,
  CertificationItem,
  TestimonialItem,
} from "@/lib/data";

import { OverviewTab } from "@/app/admin/components/OverviewTab";
import { ProfileTab } from "@/app/admin/components/ProfileTab";
import { PhotosTab } from "@/app/admin/components/PhotosTab";
import { MemoriesTab } from "@/app/admin/components/MemoriesTab";
import { ProjectsTab } from "@/app/admin/components/ProjectsTab";
import { ExperienceTab } from "@/app/admin/components/ExperienceTab";
import { SkillsTab } from "@/app/admin/components/SkillsTab";
import { ReviewsTab } from "@/app/admin/components/ReviewsTab";
import { UsersTab } from "@/app/admin/components/UsersTab";
import { AIAssistantTab } from "@/app/admin/components/AIAssistantTab";
import { FilesTab } from "@/app/admin/components/FilesTab";

type TabType = "overview" | "profile" | "photos" | "memories" | "projects" | "experience" | "skills" | "reviews" | "files" | "users" | "agent";

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "profile", label: "Profile & Text", icon: "person" },
  { id: "photos", label: "Photos", icon: "account_circle" },
  { id: "memories", label: "Memories", icon: "photo_library" },
  { id: "projects", label: "Projects", icon: "grid_view" },
  { id: "experience", label: "Experience", icon: "work" },
  { id: "skills", label: "Stack & Education", icon: "terminal" },
  { id: "reviews", label: "Testimonials", icon: "forum" },
  { id: "files", label: "Files", icon: "folder" },
  { id: "users", label: "Users", icon: "group" },
  { id: "agent", label: "AI Assistant", icon: "smart_toy" },
];

type Content = {
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  skills: SkillItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  testimonials: TestimonialItem[];
  aiSpecialization: { id?: number; name: string }[];
  databases: { id?: number; name: string }[];
  settings: Record<string, string>;
};

const EMPTY: Content = {
  projects: [],
  experiences: [],
  skills: [],
  education: [],
  certifications: [],
  testimonials: [],
  aiSpecialization: [],
  databases: [],
  settings: {},
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Open a specific tab from the link, e.g. /admin?tab=memories (used after Google sign-in).
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab") as TabType | null;
    if (tab && TABS.some((t) => t.id === tab)) setActiveTab(tab);
  }, []);

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authUsername, setAuthUsername] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [usersList, setUsersList] = useState<{ id: number; username: string; createdAt: string }[]>([]);

  // Content
  const [content, setContent] = useState<Content>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Resume upload
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
  const [geminiApiKey, setGeminiApiKey] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) setUsersList(await res.json());
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "users") fetchUsers();
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) return setIsAuthenticated(false);
        const data = await res.json();
        setAuthUsername(data.username);
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  /**
   * Loads all admin content in one request. Called after every change, so it
   * also tells Next.js to rebuild the public pages with the new content.
   */
  const loadData = useCallback(
    async (opts: { silent?: boolean; revalidate?: boolean } = {}) => {
      if (!isAuthenticated) return;
      const { silent = true, revalidate = true } = opts;
      if (!silent) setIsLoading(true);
      try {
        const [res] = await Promise.all([
          fetch("/api/admin/content", { cache: "no-store" }),
          revalidate ? fetch("/api/revalidate", { method: "POST" }) : Promise.resolve(),
        ]);
        if (res.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setContent({ ...EMPTY, ...data });
        setGeminiApiKey(data.settings?.gemini_api_key || "");
        setLoadError("");
      } catch (err: any) {
        console.error("Failed loading admin content", err);
        setLoadError(err.message || "Failed to load content");
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    loadData({ silent: false, revalidate: false });
  }, [loadData]);

  // Tabs expect `() => Promise<void>`
  const refresh = useCallback(() => loadData(), [loadData]);

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
        setAuthUsername(loginUser);
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || "Login failed");
      }
    } catch {
      setAuthError("An error occurred during login");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setIsAuthenticated(false);
    setAuthUsername("");
    setLoginUser("");
    setLoginPass("");
    setContent(EMPTY);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsResumeUploading(true);
    setResumeUploadProgress(0);
    try {
      const url = await uploadFile(file, { category: "website", onProgress: setResumeUploadProgress });

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "resume_url", value: url }),
      });
      if (!res.ok) throw new Error("Failed to save resume URL");
      await loadData();
    } catch (err: any) {
      alert("Error uploading resume: " + err.message);
    } finally {
      setIsResumeUploading(false);
      setResumeUploadProgress(0);
      e.target.value = "";
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-muted-foreground text-3xl">progress_activity</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <Card interactive={false} className="w-full max-w-sm p-8 shadow-xl">
          <header className="mb-8">
            <h1 className="font-space text-2xl font-medium tracking-tight">
              Portfolio Studio<span className="text-brand">.</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Sign in to manage your site.</p>
          </header>
          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs font-medium">
                {authError}
              </div>
            )}
            <Input label="Username" required autoComplete="username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
            <Input
              label="Password"
              required
              type="password"
              autoComplete="current-password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
            />
            <Button type="submit" disabled={isAuthLoading} variant="primary" className="w-full mt-2">
              {isAuthLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  const activeLabel = TABS.find((t) => t.id === activeTab)?.label;

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-background border-b md:border-b-0 md:border-r border-border p-4 md:p-5 flex flex-col gap-6 shrink-0 md:h-screen md:sticky md:top-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-space text-base font-medium tracking-tight">
              Studio<span className="text-brand">.</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Signed in as {authUsername}</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex mt-auto pt-4 border-t border-border flex-col gap-1">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            View live site
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-grow p-5 md:p-10 overflow-y-auto md:max-h-screen">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="font-space text-2xl md:text-3xl font-medium tracking-tight">
            {activeLabel}
            <span className="text-brand">.</span>
          </h1>
          <div className="flex md:hidden gap-2">
            <Button variant="outline" href="/" target="_blank" className="h-8 text-xs">
              Site
            </Button>
            <Button variant="outline" onClick={handleLogout} className="h-8 text-xs">
              Log out
            </Button>
          </div>
        </header>

        {loadError && (
          <div className="mb-6 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center justify-between gap-4">
            <span>Couldn&apos;t load content: {loadError}</span>
            <Button variant="outline" className="h-8 text-xs" onClick={() => loadData({ silent: false, revalidate: false })}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="material-symbols-outlined animate-spin text-muted-foreground text-3xl">progress_activity</span>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                projectsCount={content.projects.length}
                experiencesCount={content.experiences.length}
                skillsCount={content.skills.length}
                reviewsCount={content.testimonials.length}
                resumeUrl={content.settings.resume_url || ""}
                isResumeUploading={isResumeUploading}
                resumeUploadProgress={resumeUploadProgress}
                handleResumeUpload={handleResumeUpload}
                setActiveTab={setActiveTab}
                geminiApiKey={geminiApiKey}
                setGeminiApiKey={setGeminiApiKey}
              />
            )}
            {activeTab === "memories" && <MemoriesTab />}
            {activeTab === "photos" && (
              <PhotosTab key={JSON.stringify(content.settings)} settings={content.settings} loadData={refresh} />
            )}
            {activeTab === "profile" && <ProfileTab key={JSON.stringify(content.settings)} settings={content.settings} loadData={refresh} />}
            {activeTab === "projects" && <ProjectsTab projects={content.projects} loadData={refresh} />}
            {activeTab === "experience" && <ExperienceTab experiences={content.experiences} loadData={refresh} />}
            {activeTab === "skills" && (
              <SkillsTab
                skills={content.skills}
                education={content.education}
                certs={content.certifications}
                aiSpecs={content.aiSpecialization}
                databases={content.databases}
                loadData={refresh}
              />
            )}
            {activeTab === "reviews" && <ReviewsTab testimonials={content.testimonials} loadData={refresh} />}
            {activeTab === "users" && <UsersTab usersList={usersList} fetchUsers={fetchUsers} />}
            {activeTab === "files" && <FilesTab />}
          </>
        )}

        <AIAssistantTab active={activeTab === "agent"} onMutation={refresh} floating={activeTab !== "agent"} />
      </main>
    </div>
  );
}
