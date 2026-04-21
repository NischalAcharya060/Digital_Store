import { AdminInventoryClient } from "@/components/admin/admin-inventory-client";

export default function AdminInventoryPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Inventory</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Upload redeemable codes and track stock levels.
        </p>
      </header>
      <AdminInventoryClient />
    </div>
  );
}
