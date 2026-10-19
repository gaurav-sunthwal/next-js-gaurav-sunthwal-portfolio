import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = true,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-card text-card-foreground rounded-xl p-6 border border-border transition-all duration-200 ${
        interactive ? "hover:border-ring cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
