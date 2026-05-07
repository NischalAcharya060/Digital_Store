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
  { key: "all", label: "all" },
  { key: "pending", label: "pending" },
  { key: "paid", label: "paid" },
  { key: "failed", label: "failed" },
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
    <div className="space-y-6">
      <section className="border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="flex flex-col gap-4 border-b border-[color:var(--color-surface-border)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {filterTabs.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  data-active={active}
                  className={cn(
                    "link-underline inline-flex items-center gap-2 text-sm lowercase tracking-wide transition-colors",
                    active
                      ? "text-[color:var(--color-text)]"
                      : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
                  )}
                >
                  {tab.label}
                  <span className="text-[0.625rem] tabular-nums tracking-widest text-[color:var(--color-text-subtle)]">
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
          <input
            type="search"
            placeholder="Search order id or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full bg-transparent px-1 text-sm tracking-wide placeholder:text-[color:var(--color-text-subtle)] border-b border-[color:var(--color-surface-border)] text-[color:var(--color-text)] focus:border-[color:var(--color-text)] focus:outline-none sm:max-w-xs"
          />
        </div>

        {error ? (
          <div className="border-b border-[color:var(--color-surface-border)] p-6">
            <div className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_8%,transparent)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
              {error}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="p-12 text-center text-sm text-[color:var(--color-text-muted)]">
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="eyebrow">empty</p>
            <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
              No orders match the current filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-surface-border)] text-left">
                  <Th>Order</Th>
                  <Th>User</Th>
                  <Th>Placed</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-surface-border)]">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-[color:var(--color-surface-2)]"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-[color:var(--color-text)]">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-[color:var(--color-text-muted)]">
                      {order.userId.slice(0, 10)}…
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-[color:var(--color-text)]">
                      NPR {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={order.status} variant={badgeVariant(order.status)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={order.status}
                        disabled={busyId === order.id}
                        onChange={(e) =>
                          void updateStatus(
                            order.id,
                            e.target.value as AdminOrder["status"],
                          )
                        }
                        className="h-9 rounded-md border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 text-sm text-[color:var(--color-text)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20 disabled:opacity-50"
                      >
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-text-muted)] text-[10px] font-semibold text-[color:var(--color-text-muted)]">
            i
          </span>
          <div>
            <p className="text-sm font-medium text-[color:var(--color-text)]">
              Status update tip
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Changing status here bypasses the payment flow — only use it for
              manual corrections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-subtle)]",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}
