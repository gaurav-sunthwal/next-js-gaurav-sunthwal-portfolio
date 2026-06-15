import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="font-geist text-xs font-semibold uppercase tracking-wider text-[#717171]">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 h-12 bg-[#F7F7F7] border-2 border-transparent rounded-default font-geist text-sm text-[#222222] placeholder:text-[#717171]/60 focus:outline-none focus:border-primary transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="font-geist text-xs font-semibold uppercase tracking-wider text-[#717171]">
          {label}
        </label>
      )}
      <textarea
        className={`w-full p-4 min-h-[120px] bg-[#F7F7F7] border-2 border-transparent rounded-default font-geist text-sm text-[#222222] placeholder:text-[#717171]/60 focus:outline-none focus:border-primary transition-all duration-200 resize-y ${className}`}
        {...props}
      />
    </div>
  );
};
