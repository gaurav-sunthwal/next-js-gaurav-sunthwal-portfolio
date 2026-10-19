import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 h-10 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-60 ${className}`}
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
        <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <textarea
        className={`w-full p-3 min-h-[120px] bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-colors resize-y ${className}`}
        {...props}
      />
    </div>
  );
};
