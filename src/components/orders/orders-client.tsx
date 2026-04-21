"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

interface OrderSummary {
  id: string;
  totalAmount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
}

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const response = await fetch("/api/orders");
        const body = (await response.json()) as
          | { ok: true; data: { orders: OrderSummary[] } }
          | { ok: false; error: { message: string } };

        if (!response.ok || !body.ok) {
          throw new Error(!body.ok ? body.error.message : "Could not fetch orders");
        }

        setOrders(body.data.orders);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Could not fetch orders");
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading orders...</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--color-danger)]">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-slate-600">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Order ID</p>
              <p className="font-medium text-[var(--color-primary)]">{order.id}</p>
              <p className="text-sm text-slate-600">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                label={order.status}
                variant={
                  order.status === "paid"
                    ? "success"
                    : order.status === "failed"
                      ? "danger"
                      : "warning"
                }
              />
              <p className="font-semibold text-[var(--color-primary)]">
                NPR {order.totalAmount.toFixed(2)}
              </p>
              <Link
                href={`/orders/${order.id}`}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
