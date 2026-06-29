"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

interface UploadedFile {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  category: "website" | "chat" | string;
  createdAt: string;
}

export function FilesTab() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"website" | "chat">("website");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      } else {
        console.error("Failed to fetch files list");
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCopyLink = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file? This will permanently remove it from both storage and database.")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/files?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        const errData = await res.json();
        alert(`Error deleting file: ${errData.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Network error deleting file: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter files by section and search query
  const filteredFiles = files.filter((f) => {
    const matchesSection = f.category === activeSection;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf") return "description";
    if (type.startsWith("video/")) return "movie";
    if (type.startsWith("audio/")) return "volume_up";
    return "draft";
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const maxGB = 2;
  const maxBytes = maxGB * 1024 * 1024 * 1024;
  const usagePercentage = Math.min((totalBytes / maxBytes) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Storage Used Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl bg-primary/10 p-2.5 rounded-xl">
            cloud_queue
          </span>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Storage Meter</h3>
            <p className="text-xs text-on-surface-variant/75 mt-0.5">
              Manage your uploaded resume, project files and AI assistant logs here.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-1.5 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-on-surface">
            <span className="text-on-surface-variant">Used:</span>
            <span className="font-mono text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
              {formatSize(totalBytes)} / 2 GB
            </span>
          </div>
          <div className="w-full sm:w-48 h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search and Tabs Controller */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Toggle Sections */}
        <div className="flex bg-surface-container rounded-xl p-1 w-fit border border-outline-variant/20">
          <button
            onClick={() => setActiveSection("website")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === "website"
                ? "bg-primary text-white shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">web</span>
            Website Assets ({files.filter((f) => f.category === "website").length})
          </button>
          <button
            onClick={() => setActiveSection("chat")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === "chat"
                ? "bg-primary text-white shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">forum</span>
            AI Assistant Assets ({files.filter((f) => f.category === "chat").length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
          <p className="text-xs text-on-surface-variant font-medium">Loading uploaded assets...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card interactive={false} className="py-16 text-center border border-outline-variant/10 bg-surface-container-lowest rounded-2xl">
          <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-3 block">
            folder_off
          </span>
          <h3 className="text-sm font-bold text-on-surface">No files found</h3>
          <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No uploaded assets match your current search query."
              : activeSection === "website"
              ? "No files uploaded for website usage (projects screenshots, resumes, settings) yet."
              : "No files uploaded to the AI Assistant chat conversations yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              interactive={false}
              className="flex flex-col h-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all shadow-sm"
            >
              {/* Thumbnail Container */}
              <div className="aspect-video w-full bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-center relative overflow-hidden">
                {file.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">
                      {getFileIcon(file.type)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-wider">
                      {file.type.split("/").pop() || "FILE"}
                    </span>
                  </div>
                )}
                {/* Upload Date Overlay */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-white px-2 py-0.5 rounded font-medium">
                  {new Date(file.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 flex flex-col flex-grow justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-on-surface truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-mono truncate">
                    {file.type} • {formatSize(file.size)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLink(file.id, file.url)}
                    className="flex-grow py-2 text-[10px] h-9 rounded-lg flex items-center justify-center gap-1 text-on-surface bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 font-semibold cursor-pointer transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedId === file.id ? "check" : "content_copy"}
                    </span>
                    {copiedId === file.id ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingId === file.id}
                    className="py-2 text-[10px] h-9 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 aspect-square cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    title="Delete File"
                  >
                    {deletingId === file.id ? (
                      <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-xs">delete</span>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
