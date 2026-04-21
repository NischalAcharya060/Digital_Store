"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface AdminOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
}

type StatusFilter = "all" | AdminOrder["status"];

const filterTabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Failed" },
];

function badgeVariant(status: AdminOrder["status"]) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "failed":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/orders");
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Could not load orders");
      }
      setOrders(body.data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
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

  async function updateStatus(orderId: string, status: AdminOrder["status"]) {
    setBusyId(orderId);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Status update failed");
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      failed: orders.filter((o) => o.status === "failed").length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = orders;
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (q) {
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || o.userId.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [orders, filter, search]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="flex flex-col gap-3 border-b border-[color:var(--color-surface-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1">
            {filterTabs.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "bg-[color:color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[color:var(--color-accent)] ring-1 ring-inset ring-[color:color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
                      : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]",
                  )}
                >
                  {tab.label}
                  <span className="rounded-full bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-text-subtle)]">
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
          <input
            type="search"
            placeholder="Search order ID or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-4 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/25 sm:max-w-xs"
          />
        </div>

        {error ? (
          <div className="border-b border-[color:var(--color-surface-border)] p-4">
            <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--color-danger)]">
              {error}
            </p>
          </div>
        ) : null}

        {loading ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-[color:var(--color-text-muted)]">
            No orders match the current filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                  <th className="px-5 py-2">Order</th>
                  <th className="px-5 py-2">User</th>
                  <th className="px-5 py-2">Placed</th>
                  <th className="px-5 py-2">Amount</th>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-surface-border)]">
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3 font-mono text-xs text-[color:var(--color-text)]">
                      #{order.id}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[color:var(--color-text-muted)]">
                      {order.userId.slice(0, 10)}…
                    </td>
                    <td className="px-5 py-3 text-xs text-[color:var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[color:var(--color-text)]">
                      NPR {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={order.status} variant={badgeVariant(order.status)} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <select
                          value={order.status}
                          disabled={busyId === order.id}
                          onChange={(e) =>
                            void updateStatus(
                              order.id,
                              e.target.value as AdminOrder["status"],
                            )
                          }
                          className="h-8 rounded-md border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-2 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-accent)] focus:outline-none"
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="failed">failed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-[11px] text-[color:var(--color-text-subtle)]">
        Tip: changing status here bypasses the payment flow — only use it for manual
        corrections.
      </p>
    </div>
  );
}
