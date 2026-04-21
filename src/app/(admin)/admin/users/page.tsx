import { AdminUsersClient } from "@/components/admin/admin-users-client";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Users</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Manage user roles and access. Super admins control admin appointments.
        </p>
      </header>
      <AdminUsersClient />
    </div>
  );
}
