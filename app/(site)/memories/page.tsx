import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { getMemories, getSettings } from "@/lib/content";
import { MemoriesGrid } from "@/components/site/MemoriesGrid";
import { Reveal } from "@/components/site/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Memories",
  description: "Trips, people and moments away from the keyboard.",
  alternates: { canonical: "/memories" },
};

export default async function MemoriesPage() {
  const [memories, settings] = await Promise.all([getMemories(), getSettings()]);

  return (
    // data-wide-page lets this page spread wider than the usual column (see globals.css).
    <section data-wide-page className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Reveal>
          <h1 className="font-space text-2xl font-medium tracking-tight sm:text-3xl">
            Memories<span className="text-brand">.</span>
          </h1>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-sm text-muted-foreground">
            {settings.gallery_subtitle || "Life outside the editor."}
            {memories.length > 0 && <span className="text-muted-foreground/60"> · {memories.length} photos</span>}
          </p>
        </Reveal>
      </div>

      {memories.length > 0 ? (
        <div>
          <Reveal delay={120}>
            <MemoriesGrid
              photos={memories.map(({ id, url, caption, takenOn, width, height, kind, poster, duration }) => ({ id, url, caption, takenOn, width, height, kind, poster, duration }))}
            />
          </Reveal>
        </div>
      ) : (
        <Reveal delay={120}>
          <div className="stripes flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-canvas px-6 py-16 text-center">
            <ImageIcon className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No memories yet</p>
            <p className="text-xs text-muted-foreground">Photos added in the admin panel will show up here.</p>
          </div>
        </Reveal>
      )}
    </section>
  );
}
