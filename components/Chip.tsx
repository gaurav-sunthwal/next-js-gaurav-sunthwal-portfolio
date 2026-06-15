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
          ? "bg-[#222222] border-[#222222] text-white"
          : "bg-white border-divider text-[#717171] hover:text-[#222222] hover:border-[#717171]/40"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
