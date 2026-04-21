"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "gradient" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const sizeClassMap: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

const variantClassMap: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-accent)] text-[color:var(--color-text-inverse)] shadow-[0_10px_30px_-12px_rgba(34,211,238,0.55)] " +
    "hover:bg-[color:var(--color-accent-strong)] hover:shadow-[0_14px_40px_-14px_rgba(34,211,238,0.7)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]",
  gradient:
    "text-white shadow-[0_12px_40px_-12px_rgba(168,85,247,0.55)] " +
    "bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))] " +
    "hover:shadow-[0_16px_48px_-12px_rgba(168,85,247,0.75)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-2)]",
  secondary:
    "border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] " +
    "hover:border-[color:var(--color-accent)]/40 hover:text-[color:var(--color-accent)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]",
  ghost:
    "bg-transparent text-[color:var(--color-text-muted)] " +
    "hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]",
  danger:
    "bg-[color:var(--color-danger)] text-white hover:opacity-90 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-danger)]",
  success:
    "bg-[color:var(--color-success)] text-white hover:opacity-90 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-success)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", fullWidth, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClassMap[size],
        variantClassMap[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
});
