"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  return (
    <label
      className="flex w-full flex-col gap-1.5 text-sm text-[color:var(--color-text-muted)]"
      htmlFor={id}
    >
      {label ? (
        <span className="font-medium text-[color:var(--color-text)]">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-11 rounded-lg px-3 text-sm transition",
          "bg-[color:var(--color-surface)] text-[color:var(--color-text)]",
          "border border-[color:var(--color-surface-border)]",
          "placeholder:text-[color:var(--color-text-subtle)]",
          "focus:outline-none focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[color:var(--color-danger)] focus:border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/30",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-[color:var(--color-danger)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[color:var(--color-text-subtle)]">{hint}</span>
      ) : null}
    </label>
  );
});
