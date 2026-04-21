import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "accent"
  | "accent-2";

const badgeClassMap: Record<BadgeVariant, string> = {
  success:
    "bg-[color:color-mix(in_srgb,var(--color-success)_15%,transparent)] text-[color:var(--color-success)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-success)_30%,transparent)]",
  warning:
    "bg-[color:color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[color:var(--color-warning)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-warning)_30%,transparent)]",
  danger:
    "bg-[color:color-mix(in_srgb,var(--color-danger)_15%,transparent)] text-[color:var(--color-danger)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)]",
  neutral:
    "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] ring-1 ring-inset ring-[color:var(--color-surface-border)]",
  accent:
    "bg-[color:color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[color:var(--color-accent)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-accent)_35%,transparent)]",
  "accent-2":
    "bg-[color:color-mix(in_srgb,var(--color-accent-2)_15%,transparent)] text-[color:var(--color-accent-2)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-accent-2)_35%,transparent)]",
};

export function Badge({
  label,
  variant = "neutral",
  className,
}: {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeClassMap[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
