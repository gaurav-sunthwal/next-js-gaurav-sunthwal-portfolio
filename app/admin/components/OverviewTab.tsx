import React from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

interface OverviewTabProps {
  projectsCount: number;
  experiencesCount: number;
  skillsCount: number;
  reviewsCount: number;
  resumeUrl: string;
  isResumeUploading: boolean;
  resumeUploadProgress: number;
  handleResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setActiveTab: (tab: any) => void;
  geminiApiKey: string;
  setGeminiApiKey: (val: string) => void;
}

export function OverviewTab({
  projectsCount,
  experiencesCount,
  skillsCount,
  reviewsCount,
  resumeUrl,
  isResumeUploading,
  resumeUploadProgress,
  handleResumeUpload,
  setActiveTab,
  geminiApiKey,
  setGeminiApiKey,
}: OverviewTabProps) {
  const [isSavingKey, setIsSavingKey] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const handleSaveApiKey = async () => {
    if (!geminiApiKey.trim()) return;
    setIsSavingKey(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "gemini_api_key", value: geminiApiKey.trim() }),
      });
      if (res.ok) {
        alert("Gemini API Key updated successfully!");
      } else {
        alert("Failed to save Gemini API Key");
      }
    } catch (err) {
      alert("Error saving Gemini API Key");
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">grid_view</span>
          <span className="text-3xl font-extrabold">{projectsCount}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Projects</span>
        </Card>
        <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">work</span>
          <span className="text-3xl font-extrabold">{experiencesCount}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Timeline Experience</span>
        </Card>
        <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
          <span className="text-3xl font-extrabold">{skillsCount}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Skills & Tools</span>
        </Card>
        <Card interactive={false} className="p-6 bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">forum</span>
          <span className="text-3xl font-extrabold">{reviewsCount}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Testimonials</span>
        </Card>
      </div>

      <Card interactive={false} className="p-8 border border-outline-variant/20 bg-surface-container-low flex flex-col gap-4">
        <h3 className="font-title-md text-title-md font-bold">Welcome to your Portfolio Studio</h3>
        <p className="text-on-surface-variant text-sm max-w-2xl leading-relaxed">
          Everything you change here is saved to the database and appears on the live site straight away. Start with
          Profile &amp; Text to edit your name, bio, photos and links.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Button variant="primary" onClick={() => setActiveTab("profile")} className="border-none">
            Edit Profile &amp; Text
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("projects")}>
            Manage Projects
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("experience")}>
            Manage Experience
          </Button>
        </div>
      </Card>

      {/* Gemini API Settings Card */}
      <Card interactive={false} className="p-8 border border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-title-md text-title-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">vpn_key</span>
            Gemini API Settings
          </h3>
          <p className="text-on-surface-variant text-xs">
            Configure your Gemini API Key to enable the AI Admin Assistant. The key is securely stored in your database settings.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xl">
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <Input
                label="Gemini API Key"
                type={showKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter Gemini API Key (AIzaSy...)"
              />
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="h-10 px-3 aspect-square flex items-center justify-center"
              title={showKey ? "Hide Key" : "Show Key"}
            >
              <span className="material-symbols-outlined text-lg">
                {showKey ? "visibility_off" : "visibility"}
              </span>
            </Button>
            <Button
              variant="outline"
              disabled={isSavingKey}
              onClick={handleSaveApiKey}
              className="h-10"
            >
              {isSavingKey ? "Saving..." : "Save Key"}
            </Button>
          </div>
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
                className="w-full px-4 h-10 bg-surface-container-low border border-outline-variant/30 rounded-default font-geist text-sm text-on-surface focus:outline-none focus:border-primary"
                value={resumeUrl}
                readOnly
                placeholder="No resume uploaded yet"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => document.getElementById("resume-file-input")?.click()}
              disabled={isResumeUploading}
              className="h-10"
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
  );
}
