"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

interface Props {
  orderId: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  deliveredCodes?: string[];
}

interface OrderPayload {
  order: {
    id: string;
    totalAmount: number;
    status: "pending" | "paid" | "failed";
    createdAt: string;
  };
  items: OrderItem[];
}

export function OrderDetailClient({ orderId }: Props) {
  const [payload, setPayload] = useState<OrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const body = (await response.json()) as
          | { ok: true; data: OrderPayload }
          | { ok: false; error: { message: string } };

        if (!response.ok || !body.ok) {
          throw new Error(!body.ok ? body.error.message : "Could not load order");
        }

        setPayload(body.data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Could not load order");
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [orderId]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading order details...</p>;
  }

  if (error || !payload) {
    return <p className="text-sm text-[var(--color-danger)]">{error ?? "Order not found"}</p>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Order ID</p>
            <h1 className="text-xl font-semibold text-[var(--color-primary)]">{payload.order.id}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              label={payload.order.status}
              variant={
                payload.order.status === "paid"
                  ? "success"
                  : payload.order.status === "failed"
                    ? "danger"
                    : "warning"
              }
            />
            <p className="text-lg font-semibold text-[var(--color-primary)]">
              NPR {payload.order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {payload.items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
          >
            <p className="font-medium text-[var(--color-primary)]">Product: {item.productId}</p>
            <p className="text-sm text-slate-600">
              Qty {item.quantity} x NPR {item.price.toFixed(2)}
            </p>

            {payload.order.status === "paid" ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Delivered Codes
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {(item.deliveredCodes ?? []).map((code) => (
                    <li key={code} className="rounded bg-white px-2 py-1 font-mono">
                      {code}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
