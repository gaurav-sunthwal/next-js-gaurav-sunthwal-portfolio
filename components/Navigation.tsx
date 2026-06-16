"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MagneticWrap } from "./MagneticWrap";

interface NavigationProps {
  onContactClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onContactClick }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isExperiencePage = pathname === "/experience";
  const isProjectsPage = pathname === "/projects";
  const isSkillsPage = pathname === "/skills";
  const isContactPage = pathname === "/contact";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md dark:bg-surface-container/80 border-b border-outline-variant/30 dark:border-outline-variant/10 shadow-sm h-20 flex items-center transition-all duration-300">
        <div className="flex justify-between items-center w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <a
            className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface dark:text-inverse-on-surface tracking-tight z-50"
            href="/"
            onClick={closeMenu}
          >
            Gaurav Sunthwal
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a
              className={`font-body-md text-body-md font-semibold transition-colors ${
                isExperiencePage
                  ? "text-primary dark:text-primary-fixed-dim border-b-2 border-primary"
                  : "text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim"
              }`}
              href="/experience"
            >
              Experience
            </a>
            <a
              className={`font-body-md text-body-md font-semibold transition-colors ${
                isProjectsPage
                  ? "text-primary dark:text-primary-fixed-dim border-b-2 border-primary"
                  : "text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim"
              }`}
              href="/projects"
            >
              Projects
            </a>
            <a
              className={`font-body-md text-body-md font-semibold transition-colors ${
                isSkillsPage
                  ? "text-primary dark:text-primary-fixed-dim border-b-2 border-primary"
                  : "text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim"
              }`}
              href="/skills"
            >
              Skills
            </a>
            {isContactPage ? (
              <a
                className="font-body-md text-body-md text-primary dark:text-primary-fixed-dim font-semibold border-b-2 border-primary transition-all px-1 py-1"
                href="/contact"
              >
                Contact
              </a>
            ) : (
              <MagneticWrap>
                <a
                  href="/contact"
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md active:scale-95 duration-200 transition-all hover:bg-primary-container cursor-pointer inline-flex items-center justify-center"
                >
                  Contact
                </a>
              </MagneticWrap>
            )}
          </div>
          {/* Mobile menu toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-on-surface-variant flex items-center justify-center cursor-pointer z-50 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined">
              {isOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-surface/98 dark:bg-surface-container/98 flex flex-col justify-center items-center gap-8 md:hidden transition-all duration-300 animate-slide-in">
          <a
            className={`text-2xl font-bold tracking-tight py-2 border-b-2 transition-colors ${
              isExperiencePage
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent"
            }`}
            href="/experience"
            onClick={closeMenu}
          >
            Experience
          </a>
          <a
            className={`text-2xl font-bold tracking-tight py-2 border-b-2 transition-colors ${
              isProjectsPage
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent"
            }`}
            href="/projects"
            onClick={closeMenu}
          >
            Projects
          </a>
          <a
            className={`text-2xl font-bold tracking-tight py-2 border-b-2 transition-colors ${
              isSkillsPage
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent"
            }`}
            href="/skills"
            onClick={closeMenu}
          >
            Skills
          </a>
          <a
            className={`text-2xl font-bold tracking-tight py-2 border-b-2 transition-colors ${
              isContactPage
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent"
            }`}
            href="/contact"
            onClick={closeMenu}
          >
            Contact
          </a>
        </div>
      )}
    </>
  );
};

