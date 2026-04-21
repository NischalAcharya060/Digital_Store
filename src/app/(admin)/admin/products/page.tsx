import { AdminProductsClient } from "@/components/admin/admin-products-client";

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Products</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Create, edit, and remove catalog entries.
        </p>
      </header>
      <AdminProductsClient />
    </div>
  );
}
