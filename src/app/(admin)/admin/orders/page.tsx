import { AdminOrdersClient } from "@/components/admin/admin-orders-client";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Orders</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Review every order and override payment status when needed.
        </p>
      </header>
      <AdminOrdersClient />
    </div>
  );
}
