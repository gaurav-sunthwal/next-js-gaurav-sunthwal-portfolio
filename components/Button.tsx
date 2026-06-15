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
  const baseClass = variant === "primary"
    ? `px-5 h-10 inline-flex items-center justify-center font-geist font-medium text-sm rounded-default bg-primary text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-primary-dark transition-all duration-200 cursor-pointer active:scale-98 ${className}`
    : variant === "outline"
    ? `px-5 h-10 inline-flex items-center justify-center font-geist font-medium text-sm rounded-default bg-transparent border border-[#222222] text-[#222222] hover:bg-surface-low transition-all duration-200 cursor-pointer active:scale-98 ${className}`
    : `px-5 h-10 inline-flex items-center justify-center font-geist font-medium text-sm rounded-default bg-secondary text-white hover:bg-secondary/90 transition-all duration-200 cursor-pointer active:scale-98 ${className}`;

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

