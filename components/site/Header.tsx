"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderGit2, Home, Images, Mail, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./Sounds";
import { frameWidth, useIsWidePage } from "./HideOnWidePages";
import { GithubIcon, LinkedinIcon } from "./brand-icons";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: User },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/memories", label: "Memories", icon: Images },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Header({ github, linkedin }: { github?: string; linkedin?: string }) {
  const pathname = usePathname();
  const wide = useIsWidePage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <div
        className={`flex h-14 w-full ${frameWidth(wide)} items-center justify-end border-b border-border px-3 transition-[background-color,max-width] duration-200 ${
          scrolled ? "bg-background/80 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        {/* Desktop */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-sfx="soft"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive(item.href)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <span role="none" className="mx-1 h-4 w-px bg-border" />
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              data-tooltip="GitHub"
              data-tooltip-side="bottom"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <GithubIcon />
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-tooltip="LinkedIn"
              data-tooltip-side="bottom"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LinkedinIcon />
            </a>
          )}
          <span role="none" className="mx-1 h-4 w-px bg-border" />
          <SoundToggle />
          <ThemeToggle />
        </nav>

        {/* Mobile */}
        <nav className="mr-auto flex items-center gap-0.5 sm:hidden">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                data-sfx="soft"
                data-tooltip={item.label}
                data-tooltip-side="bottom"
                aria-current={active ? "page" : undefined}
                className={`flex size-8 items-center justify-center rounded-md transition-colors ${
                  active ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1 sm:hidden">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
