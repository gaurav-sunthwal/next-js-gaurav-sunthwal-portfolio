import React from "react";
import { MagneticWrap } from "./MagneticWrap";
import { Button } from "./Button";

interface ConnectProps {
  id?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryButtonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  secondaryButtonAction?: () => void;
  showLinks?: boolean;
}

export const Connect: React.FC<ConnectProps> = ({
  id,
  title = "Let's build something exceptional together.",
  description = "Open to opportunities in AI-driven startups and innovative engineering teams. Let's discuss how my full-stack expertise can contribute to your goals.",
  primaryButtonText = "Start a Conversation",
  primaryButtonHref,
  primaryButtonAction,
  secondaryButtonText = "Check Availability",
  secondaryButtonHref = "#",
  secondaryButtonAction,
  showLinks = true,
}) => {
  return (
    <section
      id={id}
      className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-32 md:mt-40 mb-24 md:mb-40 reveal"
    >
      <div className="bg-primary text-on-primary rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center text-center airbnb-shadow overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Visual Interest Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-primary-container rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-2xl w-full space-y-8 flex flex-col items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
            {title}
          </h2>
          <p className="text-lg opacity-90 leading-relaxed">{description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticWrap className="w-full sm:w-auto">
              <Button
                variant={"secondary"}
                href={primaryButtonHref}
                onClick={primaryButtonAction}
                className="bg-on-primary text-primary px-10 py-5 h-auto rounded-full font-bold w-full sm:w-auto hover:scale-105 active:scale-95 inline-flex items-center justify-center cursor-pointer shadow-none border-none"
              >
                {primaryButtonText}
              </Button>
            </MagneticWrap>

            <Button
              variant="outline"
              href={secondaryButtonHref}
              onClick={secondaryButtonAction}
              target={secondaryButtonHref && secondaryButtonHref !== "#" ? "_blank" : undefined}
              rel={secondaryButtonHref && secondaryButtonHref !== "#" ? "noopener noreferrer" : undefined}
              className="border-white text-white hover:bg-white/10 px-10 py-5 h-auto rounded-full font-bold transition-all w-full sm:w-auto inline-flex items-center justify-center active:scale-95 cursor-pointer shadow-none"
            >
              {secondaryButtonText}
            </Button>
          </div>


          {showLinks && (
            <div className="flex justify-center gap-8 pt-8 opacity-80">
              <a className="hover:text-white transition-colors" href="https://linkedin.com/in/gaurav-sunthwal" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a className="hover:text-white transition-colors" href="https://github.com/gaurav-sunthwal" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="hover:text-white transition-colors" href="mailto:gauravsunthwalwork@gmail.com">
                Email
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
