import React from "react";
import { cn } from "@/lib/utilities";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
          {props.required && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-xl border bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 focus-ring transition-colors",
          error ? "border-danger" : "border-ink-200 focus:border-brand-400",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
