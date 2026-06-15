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
      className={`bg-white rounded-xl p-6 shadow-resting transition-all duration-300 ${
        interactive ? "hover:shadow-hover hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
