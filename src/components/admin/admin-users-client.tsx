"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { UserProfile, UserRole, UserStatus } from "@/types/domain";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | UserStatus;
type ManagedRole = Exclude<UserRole, "super_admin">;

const adminManagedRoles: ManagedRole[] = ["user", "moderator"];
const superAdminManagedRoles: ManagedRole[] = ["user", "moderator", "admin"];

const roleTabs: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "super_admin", label: "Super admins" },
  { key: "admin", label: "Admins" },
  { key: "moderator", label: "Moderators" },
  { key: "user", label: "Users" },
];

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Any status" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
];

function roleBadgeVariant(role: UserRole) {
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

function getRoleOptions(actorRole: UserRole | null, targetRole: UserRole): UserRole[] {
  if (targetRole === "super_admin") {
    return ["super_admin"];
  }

  if (actorRole === "super_admin") {
    return superAdminManagedRoles;
  }

  if (actorRole === "admin" && (targetRole === "user" || targetRole === "moderator")) {
    return adminManagedRoles;
  }

  return [targetRole];
}

function canEditRole(
  actorRole: UserRole | null,
  targetRole: UserRole,
  isSelf: boolean,
  busy: boolean,
) {
  if (busy || isSelf || !actorRole) return false;
  if (actorRole === "super_admin") return targetRole !== "super_admin";
  if (actorRole === "admin") return targetRole === "user" || targetRole === "moderator";
  return false;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [actorId, setActorId] = useState<string>("");
  const [actorRole, setActorRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banModalUser, setBanModalUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to load users");
      }
      setUsers(body.data.users);
      setActorId(body.data.actorId);
      setActorRole(body.data.actorRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function changeRole(user: UserProfile, nextRole: UserRole) {
    if (nextRole === user.role) return;
    const confirmMsg =
      nextRole === "admin"
        ? `Promote ${user.email} to admin? They will gain full control.`
        : `Change ${user.email}'s role to ${nextRole}?`;
    if (!confirm(confirmMsg)) return;

    setBusyId(user.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Role update failed");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function updateStatus(
    user: UserProfile,
    nextStatus: UserStatus,
    reason?: string,
  ) {
    setBusyId(user.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          reason: reason?.trim() || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Status update failed");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...body.data.user } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setBusyId(null);
    }
  }

  function openBanModal(user: UserProfile) {
    setError(null);
    setNotice(null);
    setBanModalUser(user);
    setBanReason("");
  }

  function closeBanModal() {
    if (banModalUser && busyId === banModalUser.id) {
      return;
    }
    setBanModalUser(null);
    setBanReason("");
  }

  async function submitBan() {
    if (!banModalUser) return;
    await updateStatus(banModalUser, "suspended", banReason);
    setBanModalUser(null);
    setBanReason("");
  }

  async function reactivateUser(user: UserProfile) {
    if (!confirm(`Reactivate ${user.email}?`)) return;
    await updateStatus(user, "active");
  }

  async function copyUserId(user: UserProfile) {
    setError(null);
    setNotice(null);
    try {
      await navigator.clipboard.writeText(user.id);
      setNotice(`Copied UID for ${user.email}`);
    } catch {
      setError("Unable to copy UID");
    }
  }

  const counts = useMemo(() => {
    return {
      all: users.length,
      super_admin: users.filter((u) => u.role === "super_admin").length,
      admin: users.filter((u) => u.role === "admin").length,
      moderator: users.filter((u) => u.role === "moderator").length,
      user: users.filter((u) => u.role === "user").length,
      active: users.filter((u) => (u.status ?? "active") === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users;
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all") {
      list = list.filter((u) => (u.status ?? "active") === statusFilter);
    }
    if (q) {
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [users, roleFilter, statusFilter, search]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-5">
        <StatTile label="Total users" value={counts.all} tone="accent" />
        <StatTile label="Super admins" value={counts.super_admin} tone="danger" />
        <StatTile label="Admins" value={counts.admin} tone="accent" />
        <StatTile label="Moderators" value={counts.moderator} tone="accent-2" />
        <StatTile label="Suspended" value={counts.suspended} tone="danger" />
      </section>

      {/* Controls */}
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="flex flex-col gap-3 border-b border-[color:var(--color-surface-border)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1">
            {roleTabs.map((tab) => {
              const active = roleFilter === tab.key;
              const count = counts[tab.key as keyof typeof counts] ?? 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRoleFilter(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "bg-[color:color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[color:var(--color-accent)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
                      : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]",
                  )}
                >
                  {tab.label}
                  <span className="rounded-full bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-text-subtle)]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-10 rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-3 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-accent)] focus:outline-none"
            >
              {statusTabs.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Search email, name, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-4 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/25 sm:max-w-xs"
            />
          </div>
        </div>

        {error ? (
          <div className="border-b border-[color:var(--color-surface-border)] p-4">
            <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--color-danger)]">
              {error}
            </p>
          </div>
        ) : null}
        {notice ? (
          <div className="border-b border-[color:var(--color-surface-border)] p-4">
            <p className="rounded-lg border border-[color:var(--color-success)]/30 bg-[color:color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--color-success)]">
              {notice}
            </p>
          </div>
        ) : null}

        {loading ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-[color:var(--color-text-muted)]">
            No users match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                  <th className="px-5 py-2">User</th>
                  <th className="px-5 py-2">Role</th>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2">Joined</th>
                  <th className="px-5 py-2">Last login</th>
                  <th className="px-5 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-surface-border)]">
                {filtered.map((user) => {
                  const isSelf = user.id === actorId;
                  const isSuspended = user.status === "suspended";
                  const busy = busyId === user.id;
                  const canManageUsers =
                    actorRole === "admin" || actorRole === "super_admin";
                  const roleOptions = getRoleOptions(actorRole, user.role);
                  const roleEditable = canEditRole(actorRole, user.role, isSelf, busy);
                  const accountActionRestricted =
                    !canManageUsers ||
                    user.role === "super_admin" ||
                    (actorRole === "admin" && user.role === "admin");

                  return (
                    <tr key={user.id} className={cn(isSuspended && "opacity-80")}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-xs font-bold text-white">
                            {(user.name || user.email).slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-text)]">
                              {user.name || "—"}
                              {isSelf ? (
                                <span className="rounded bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-[color:var(--color-text-muted)]">
                              {user.email}
                            </p>
                            <p className="truncate font-mono text-[10px] text-[color:var(--color-text-subtle)]">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Badge label={user.role} variant={roleBadgeVariant(user.role)} />
                          <select
                            value={user.role}
                            disabled={!roleEditable}
                            onChange={(e) =>
                              void changeRole(user, e.target.value as UserRole)
                            }
                            className="h-8 rounded-md border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-2 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-accent)] focus:outline-none disabled:opacity-50"
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {isSuspended ? (
                          <div className="space-y-0.5">
                            <Badge label="Suspended" variant="danger" />
                            {user.suspendedReason ? (
                              <p
                                className="max-w-[180px] truncate text-[10px] text-[color:var(--color-text-subtle)]"
                                title={user.suspendedReason}
                              >
                                {user.suspendedReason}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <Badge label="Active" variant="success" />
                        )}
                      </td>

                      <td className="px-5 py-3 text-xs text-[color:var(--color-text-muted)]">
                        {fmtDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-xs text-[color:var(--color-text-muted)]">
                        {fmtDate(user.lastLoginAt)}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="sm"
                            variant={isSuspended ? "success" : "secondary"}
                            disabled={busy || isSelf || accountActionRestricted}
                            onClick={() =>
                              isSuspended
                                ? void reactivateUser(user)
                                : openBanModal(user)
                            }
                          >
                            {isSuspended ? "Reactivate" : "Ban"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => void copyUserId(user)}
                          >
                            Copy UID
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-[11px] text-[color:var(--color-text-subtle)]">
        Admins can assign user/moderator roles only. Super admins can appoint admins.
      </p>
      <p className="text-[11px] text-[color:var(--color-text-subtle)]">
        Suspending a user revokes their Firebase Auth tokens and blocks new sign-ins.
        User deletion is disabled in this admin panel.
      </p>

      {banModalUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
            <h3 className="text-base font-semibold text-[color:var(--color-text)]">
              Ban user
            </h3>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Suspend <span className="font-medium">{banModalUser.email}</span>. They
              will be signed out and blocked from new sign-ins.
            </p>
            <label className="mt-4 flex flex-col gap-1.5 text-sm text-[color:var(--color-text-muted)]">
              <span className="font-medium text-[color:var(--color-text)]">
                Reason (optional)
              </span>
              <textarea
                rows={4}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for this ban..."
                className="resize-y rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={busyId === banModalUser.id}
                onClick={closeBanModal}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={busyId === banModalUser.id}
                onClick={() => void submitBan()}
              >
                {busyId === banModalUser.id ? "Banning..." : "Confirm ban"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "accent-2" | "danger";
}) {
  return (
    <div className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-text-subtle)]">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-bold"
        style={{ color: `var(--color-${tone})` }}
      >
        {value}
      </p>
    </div>
  );
}
