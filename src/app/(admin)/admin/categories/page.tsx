import { AdminCategoriesClient } from "@/components/admin/admin-categories-client";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Categories</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Group products so customers can browse by type.
        </p>
      </header>
      <AdminCategoriesClient />
    </div>
  );
}
