import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getCurrentUserProfile } from "@/lib/auth/server";
import type { UserRole } from "@/types/domain";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function roleVariant(role: UserRole) {
  switch (role) {
    case "super_admin":
      return "warning" as const;
    case "admin":
      return "accent" as const;
    case "moderator":
      return "accent-2" as const;
    default:
      return "neutral" as const;
  }
}

function formatRole(role: UserRole) {
  return role.replace("_", " ");
}

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">My Profile</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Account details and activity for your Digital Store profile.
        </p>
      </header>

      <section className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-base font-semibold text-white">
              {(profile.name || profile.email).slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-base font-semibold text-[color:var(--color-text)]">{profile.name}</p>
              <p className="text-sm text-[color:var(--color-text-muted)]">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={formatRole(profile.role)} variant={roleVariant(profile.role)} />
            <Badge
              label={profile.status === "suspended" ? "suspended" : "active"}
              variant={profile.status === "suspended" ? "danger" : "success"}
            />
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">User ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-[color:var(--color-text-muted)]">{profile.id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">Created</dt>
            <dd className="mt-1 text-sm text-[color:var(--color-text)]">{formatDate(profile.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">Last login</dt>
            <dd className="mt-1 text-sm text-[color:var(--color-text)]">{formatDate(profile.lastLoginAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">Suspended reason</dt>
            <dd className="mt-1 text-sm text-[color:var(--color-text)]">{profile.suspendedReason ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/orders"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 text-sm font-medium text-[color:var(--color-text)] transition hover:border-[color:var(--color-accent)]/40 hover:text-[color:var(--color-accent)]"
        >
          View orders
        </Link>
        {(profile.role === "admin" ||
          profile.role === "super_admin" ||
          profile.role === "moderator") && (
          <Link
            href="/admin/profile"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))] px-4 text-sm font-medium text-white"
          >
            Open admin profile
          </Link>
        )}
      </div>
    </div>
  );
}
