import { Badge } from "@/components/ui/badge";
import { requireStaffUser } from "@/lib/auth/server";
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

function roleLabel(role: UserRole) {
  return role.replace("_", " ");
}

function roleCapabilities(role: UserRole) {
  if (role === "super_admin") {
    return "Full staff access including admin appointment and user-role management.";
  }
  if (role === "admin") {
    return "Can manage catalog, inventory, orders, and assign user/moderator roles.";
  }
  if (role === "moderator") {
    return "Can manage catalog, inventory, and orders. Users tab is read-only.";
  }
  return "No staff capabilities.";
}

export default async function AdminProfilePage() {
  const profile = await requireStaffUser();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Admin Profile</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Staff identity, role level, and access scope for this account.
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
            <Badge label={roleLabel(profile.role)} variant={roleVariant(profile.role)} />
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
            <dt className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">Access scope</dt>
            <dd className="mt-1 text-sm text-[color:var(--color-text)]">{roleCapabilities(profile.role)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
