import React from "react";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  meta?: string;
  children?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  meta,
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-divider gap-2 last:border-b-0 ${className}`}
      {...props}
    >
      <div className="flex flex-col">
        <h4 className="font-geist text-sm font-semibold text-[#222222]">
          {title}
        </h4>
        {subtitle && (
          <p className="font-geist text-xs text-[#717171] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {meta && (
          <span className="font-geist text-xs font-medium text-[#717171] uppercase tracking-wider">
            {meta}
          </span>
        )}
        {children}
      </div>
    </div>
  );
};
