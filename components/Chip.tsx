import React from "react";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`px-4 py-2 font-geist text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer border select-none ${
        active
          ? "bg-foreground border-foreground text-background"
          : "bg-background border-divider text-muted-foreground hover:text-foreground hover:border-ring"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
