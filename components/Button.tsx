import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  href,
  target,
  rel,
  download,
  children,
  className = "",
  ...props
}) => {
  const base =
    "px-4 h-10 inline-flex items-center justify-center gap-1.5 font-sans font-medium text-sm rounded-lg transition-colors duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const styles = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    outline: "bg-background border border-border text-foreground hover:bg-muted",
    secondary: "bg-muted text-foreground hover:bg-muted/70",
  };
  const baseClass = `${base} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClass} target={target} rel={rel} download={download}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
};

