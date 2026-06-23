import React from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";

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
  heroTitle: string;
  setHeroTitle: (val: string) => void;
  heroTitleHighlight: string;
  setHeroTitleHighlight: (val: string) => void;
  heroDescription: string;
  setHeroDescription: (val: string) => void;
  isSavingTexts: boolean;
  handleSaveTexts: (title: string, highlight: string, description: string) => void;
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
  heroTitle,
  setHeroTitle,
  heroTitleHighlight,
  setHeroTitleHighlight,
  heroDescription,
  setHeroDescription,
  isSavingTexts,
  handleSaveTexts,
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
              className="h-12 px-3 aspect-square flex items-center justify-center"
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
              className="h-12"
            >
              {isSavingKey ? "Saving..." : "Save Key"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Homepage Hero Texts settings */}
      <Card interactive={false} className="p-8 border border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-title-md text-title-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Homepage Hero Settings
          </h3>
          <p className="text-on-surface-variant text-xs">
            Edit the main title and description displayed in the hero section of the homescreen. You can use HTML tags like <code>&lt;span class="text-primary"&gt;Text&lt;/span&gt;</code> to highlight text in the title.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xl">
          <Input
            label="Hero Title"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="e.g. Full Stack Developer specializing in Generative AI"
          />
          <Input
            label="Hero Title Highlighted Part"
            value={heroTitleHighlight}
            onChange={(e) => setHeroTitleHighlight(e.target.value)}
            placeholder="e.g. <span class=&quot;text-primary&quot;>Generative AI</span>"
          />
          <TextArea
            label="Hero Description"
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            placeholder="e.g. Building production-ready AI products..."
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => handleSaveTexts(heroTitle, heroTitleHighlight, heroDescription)}
              disabled={isSavingTexts}
              className="border-none"
            >
              {isSavingTexts ? "Saving..." : "Save Changes"}
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
  );
}
