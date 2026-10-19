import { CalendarDays, Mail } from "lucide-react";
import { getSettings } from "@/lib/content";
import { ContactForm } from "@/components/site/ContactForm";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/site/brand-icons";
import { Reveal } from "@/components/site/ui";

export const revalidate = 300;

export default async function ContactPage() {
  const settings = await getSettings();
  const channels = [
    settings.email && { label: settings.email, href: `mailto:${settings.email}`, Icon: Mail },
    settings.booking_url && { label: "Book a call", href: settings.booking_url, Icon: CalendarDays },
    settings.social_linkedin && { label: "LinkedIn", href: settings.social_linkedin, Icon: LinkedinIcon },
    settings.social_github && { label: "GitHub", href: settings.social_github, Icon: GithubIcon },
    settings.social_x && { label: "X / Twitter", href: settings.social_x, Icon: XIcon },
  ].filter(Boolean) as { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[];

  return (
    <>
      <section className="flex flex-col gap-2">
        <Reveal>
          <h1 className="font-space text-2xl font-medium tracking-tight sm:text-3xl">
            Let&apos;s talk<span className="text-brand">.</span>
          </h1>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-sm leading-relaxed text-muted-foreground">{settings.contact_description}</p>
        </Reveal>
      </section>

      <Reveal delay={120}>
        <ContactForm />
      </Reveal>

      {channels.length > 0 && (
        <Reveal delay={160}>
          <ul className="flex flex-wrap gap-2">
            {channels.map(({ label, href, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                >
                  <Icon className="size-3.5" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </>
  );
}
