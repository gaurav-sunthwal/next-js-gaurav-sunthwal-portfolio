import { getSettings } from "@/lib/content";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SideRails } from "@/components/site/SideRails";
import { TooltipLayer } from "@/components/site/TooltipLayer";
import { SoundEffects } from "@/components/site/Sounds";
import { RevealObserver } from "@/components/site/RevealObserver";
import { HideOnWidePages, SiteFrame } from "@/components/site/HideOnWidePages";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <SiteFrame>
        <main className="relative flex min-h-dvh flex-col gap-8">{children}</main>
        <Footer settings={settings} />
      </SiteFrame>
      <Header github={settings.social_github} linkedin={settings.social_linkedin} />
      <HideOnWidePages>
        <SideRails settings={settings} />
      </HideOnWidePages>
      <TooltipLayer />
      <SoundEffects />
      <RevealObserver />
    </>
  );
}
