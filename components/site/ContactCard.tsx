import Link from "next/link";
import { CalendarDays, Mail } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { LinkedinIcon } from "./brand-icons";

export function ContactCard({ settings }: { settings: SiteSettings }) {
  const primary = settings.booking_url
    ? { href: settings.booking_url, label: "Book a call", Icon: CalendarDays, external: true }
    : { href: "/contact", label: "Send a message", Icon: Mail, external: false };
  const backdrop = settings.contact_backdrop;
  const primaryClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-white/90";

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-neutral-900">
      {backdrop ? (
        <>
          {/* eslint-disable @next/next/no-img-element */}
          <img src={backdrop} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-30 size-full object-cover" />
          {/* Blurred copy on the left keeps the text readable */}
          <img
            src={backdrop}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 -z-20 size-full scale-125 object-cover blur-2xl mask-[linear-gradient(to_right,black_35%,transparent_80%)]"
          />
          {/* eslint-enable @next/next/no-img-element */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-black/60 via-black/30 via-55% to-transparent" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(120%_120%_at_100%_0%,color-mix(in_oklab,var(--brand)_55%,transparent)_0%,transparent_55%),radial-gradient(90%_90%_at_0%_100%,color-mix(in_oklab,var(--brand)_25%,transparent)_0%,transparent_60%)]"
        />
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      <div className="flex flex-col gap-6 px-7 py-10 sm:py-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-space text-2xl font-medium leading-tight tracking-tight text-white sm:text-3xl">
            {settings.contact_title}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/80">{settings.contact_description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {primary.external ? (
            <a href={primary.href} target="_blank" rel="noopener noreferrer" data-sfx="tap" className={primaryClass}>
              <primary.Icon className="size-4" />
              {primary.label}
            </a>
          ) : (
            <Link href={primary.href} data-sfx="tap" className={primaryClass}>
              <primary.Icon className="size-4" />
              {primary.label}
            </Link>
          )}
          {settings.social_linkedin && (
            <a
              href={settings.social_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="tap"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <LinkedinIcon />
              Message on LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
