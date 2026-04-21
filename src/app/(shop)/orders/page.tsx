import { OrdersClient } from "@/components/orders/orders-client";

export default function OrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-[var(--color-primary)]">Order History</h1>
      <OrdersClient />
    </div>
  );
}
