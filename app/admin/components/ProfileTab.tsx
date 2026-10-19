import React, { useMemo, useState } from "react";
import { useImageCrop, ASPECTS } from "@/app/admin/components/ImageCropper";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { RichText } from "@/components/site/RichText";
import { SITE_SETTING_DEFAULTS, splitLines, type SiteSettingKey } from "@/lib/site-settings";

type Field = {
  key: SiteSettingKey;
  label: string;
  hint?: string;
  multiline?: boolean;
  mono?: boolean;
  upload?: "append" | "replace";
};

const SECTIONS: { title: string; icon: string; description: string; fields: Field[] }[] = [
  {
    title: "Hero & bio",
    icon: "person",
    description: "The top of the home page.",
    fields: [
      { key: "name", label: "Name" },
      { key: "tagline", label: "Tagline", hint: "Short line under your name, e.g. “22y/o full-stack engineer”." },
      { key: "show_verified", label: "Verified badge next to name", hint: "Type true to show the blue check, false to hide it." },
      {
        key: "bio",
        label: "Short bio",
        multiline: true,
        hint: "__word__ = hand-drawn blue underline · **word** = bold · ~~word~~ = word that opens the font/colour picker on hover · [text](https://site.com) = link with a live website preview on hover · [text](/projects/project-id) = link with a project card on hover.",
      },
    ],
  },
  {
    title: "Quick facts",
    icon: "badge",
    description: "The small list under your bio.",
    fields: [
      { key: "current_role", label: "Current role" },
      { key: "current_company", label: "Current company" },
      { key: "current_company_logo", label: "Company logo URL", upload: "replace" },
      { key: "current_company_url", label: "Company website" },
      { key: "location", label: "Location" },
      { key: "email", label: "Email" },
      {
        key: "highlights",
        label: "Extra highlights (one per line)",
        multiline: true,
        mono: true,
        hint: "Format: text | link | icon URL (link and icon optional). Example: Top 10% on LeetCode | https://leetcode.com/u/you",
      },
    ],
  },
  {
    title: "Links",
    icon: "link",
    description: "Header, side rails, footer and contact page.",
    fields: [
      { key: "github_username", label: "GitHub username", hint: "Powers the “A year in commits” graph. Leave empty to hide it." },
      { key: "social_github", label: "GitHub URL" },
      { key: "social_linkedin", label: "LinkedIn URL" },
      { key: "social_x", label: "X / Twitter URL" },
      { key: "social_youtube", label: "YouTube URL" },
      { key: "booking_url", label: "Booking link (Cal.com / Calendly)", hint: "Adds “Book a call” buttons when set." },
    ],
  },
  {
    title: "Contact card & footer",
    icon: "call",
    description: "The dark card at the bottom of the home page.",
    fields: [
      { key: "contact_title", label: "Card title" },
      { key: "contact_description", label: "Card text", multiline: true },
      { key: "contact_backdrop", label: "Card background image (optional)", upload: "replace" },
      { key: "footer_note", label: "Footer note", multiline: true },
    ],
  },
  {
    title: "About page",
    icon: "article",
    description: "Extra long-form text shown on /about.",
    fields: [
      { key: "about_long", label: "About page text (Markdown)", multiline: true, mono: true },
    ],
  },
];

export function ProfileTab({
  settings,
  loadData,
}: {
  settings: Record<string, string>;
  loadData: () => Promise<void>;
}) {
  const initial = useMemo(() => {
    const values = {} as Record<SiteSettingKey, string>;
    for (const key of Object.keys(SITE_SETTING_DEFAULTS) as SiteSettingKey[]) {
      values[key] = settings[key] ?? SITE_SETTING_DEFAULTS[key];
    }
    return values;
  }, [settings]);

  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<SiteSettingKey | null>(null);
  const { cropper, cropAndUpload } = useImageCrop();
  // Logos are square; the contact card background is a wide banner.
  const cropFor = (key: SiteSettingKey) =>
    key === "contact_backdrop"
      ? { aspects: [ASPECTS.banner, ASPECTS.video, ASPECTS.wide, ASPECTS.original], title: "Crop background" }
      : { aspects: [ASPECTS.square, ASPECTS.original], title: "Crop image" };
  const [status, setStatus] = useState("");


  const dirty = (Object.keys(values) as SiteSettingKey[]).filter((k) => values[k] !== initial[k]);

  const set = (key: SiteSettingKey, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const upload = async (field: Field, file: File) => {
    setUploading(field.key);
    try {
      const [url] = await cropAndUpload([file], cropFor(field.key));
      if (!url) return;
      setValues((v) => ({
        ...v,
        [field.key]: field.upload === "append" ? [...splitLines(v[field.key]), url].join("\n") : url,
      }));
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (dirty.length === 0) return;
    setSaving(true);
    setStatus("");
    try {
      const payload = Object.fromEntries(dirty.map((k) => [k, values[k]]));
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: payload }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setStatus(`Saved ${dirty.length} field${dirty.length === 1 ? "" : "s"}. The live site is updated.`);
      await loadData();
    } catch (err: any) {
      setStatus("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {cropper}
      <div>
        <h2 className="text-xl font-bold">Profile & site text</h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Everything here appears on the public site. Changes go live as soon as you save. Profile photos and the
          &ldquo;Touching grass&rdquo; gallery are managed in the Photos tab.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <Card key={section.title} interactive={false} className="p-6 md:p-8 border border-border bg-surface-container-lowest space-y-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-title-md text-title-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">{section.icon}</span>
              {section.title}
            </h3>
            <p className="text-xs text-on-surface-variant">{section.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {section.fields.map((field) => {
              const wide = field.multiline || field.hint;
              return (
                <div key={field.key} className={`flex flex-col gap-2 ${wide ? "md:col-span-2" : ""}`}>
                  <div className="flex items-end gap-2">
                    {field.multiline ? (
                      <TextArea
                        label={field.label}
                        value={values[field.key]}
                        onChange={(e) => set(field.key, e.target.value)}
                        className={field.mono ? "font-mono text-xs min-h-[96px]" : "min-h-[96px]"}
                      />
                    ) : (
                      <Input label={field.label} value={values[field.key]} onChange={(e) => set(field.key, e.target.value)} />
                    )}
                    {field.upload && (
                      <label className="h-10 px-3 rounded-default border border-border bg-background text-on-surface font-semibold text-xs flex items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors shrink-0">
                        {uploading === field.key ? "Uploading…" : field.upload === "append" ? "Add photo" : "Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) upload(field, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {field.hint && <p className="text-[11px] text-on-surface-variant">{field.hint}</p>}
                  {field.key === "bio" && values.bio && (
                    <div className="rounded-lg border border-dashed border-border bg-background p-3 text-sm text-muted-foreground leading-relaxed">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">Preview</span>
                      <RichText text={values.bio} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Sticky save bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[calc(50%+8rem)] z-40 flex items-center gap-4 rounded-xl border border-border bg-background/95 backdrop-blur px-4 py-3 shadow-lg">
        <span className="text-xs text-on-surface-variant">
          {status || (dirty.length ? `${dirty.length} unsaved change${dirty.length === 1 ? "" : "s"}` : "All changes saved")}
        </span>
        <Button variant="outline" disabled={dirty.length === 0 || saving} onClick={() => setValues(initial)} className="h-9 text-xs">
          Reset
        </Button>
        <Button variant="primary" disabled={dirty.length === 0 || saving} onClick={save} className="h-9 text-xs border-none">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
