import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated";
  interactive?: boolean;
}

const variantClassMap: Record<NonNullable<CardProps["variant"]>, string> = {
  default:
    "bg-[color:var(--color-surface)] border border-[color:var(--color-surface-border)] shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset,0_6px_20px_-12px_rgba(0,0,0,0.25)]",
  flat:
    "bg-[color:var(--color-surface-2)] border border-[color:var(--color-surface-border)]",
  elevated:
    "bg-[color:var(--color-surface)] border border-[color:var(--color-surface-border)] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.5)]",
};

export function Card({
  children,
  className,
  variant = "default",
  interactive = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 transition",
        variantClassMap[variant],
        interactive &&
          "hover:border-[color:var(--color-accent)]/35 hover:shadow-[0_22px_60px_-20px_rgba(34,211,238,0.2)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
