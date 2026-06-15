import React from "react";

interface FooterProps {
  simple?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ simple = false }) => {
  if (simple) {
    return (
      <footer className="w-full py-12 bg-surface-bright dark:bg-surface-container-low border-t border-outline-variant/20 dark:border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-gutter-mobile px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <p className="font-label-md text-label-md text-secondary dark:text-secondary-fixed-dim opacity-80 transition-opacity">
            © 2024 Gaurav Sunthwal. Built with Precision.
          </p>
          <div className="flex gap-6">
            <a
              className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors underline"
              href="https://linkedin.com/in/gaurav-sunthwal"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors underline"
              href="https://github.com/gaurav-sunthwal"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors underline"
              href="mailto:gauravsunthwalwork@gmail.com"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-surface-bright border-t border-outline-variant/20 py-24 w-full">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 border-b border-outline-variant/10 pb-12 mb-12 w-full">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tighter text-on-surface">Gaurav Sunthwal</h3>
            <p className="text-on-surface-variant max-w-xs text-sm">
              Building bridges between human intuition and machine intelligence with architectural precision.
            </p>
          </div>
          <div className="flex gap-x-12 gap-y-6">
            <div className="space-y-4">
              <p className="text-xs font-bold text-primary uppercase">Quick Links</p>
              <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
                <li>
                  <a className="hover:text-primary transition-colors" href="/experience">
                    Experience
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="/projects">
                    Projects
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="/skills">
                    Skills
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-bold text-primary uppercase">Contact</p>
              <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
                <li>
                  <a className="hover:text-primary transition-colors" href="mailto:gauravsunthwalwork@gmail.com">
                    Email
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="https://linkedin.com/in/gaurav-sunthwal"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="https://github.com/gaurav-sunthwal"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-secondary font-medium w-full">
          <p>© 2024 Gaurav Sunthwal. Built for the future of AI.</p>
          <div className="flex gap-8">
            <a className="hover:text-primary" href="#">
              Privacy
            </a>
            <a className="hover:text-primary" href="#">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
