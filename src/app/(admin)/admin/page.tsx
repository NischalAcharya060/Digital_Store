import Link from "next/link";

import { listAllProducts } from "@/services/catalog.service";
import { listAllOrders } from "@/services/order.service";

const quickActions = [
  {
    title: "Add product",
    description: "Publish a new digital item to the catalog.",
    href: "/admin/products",
    accent: "accent",
  },
  {
    title: "Upload inventory",
    description: "Paste digital codes to refill stock.",
    href: "/admin/inventory",
    accent: "accent-2",
  },
  {
    title: "Review orders",
    description: "Track pending and paid orders.",
    href: "/admin/orders",
    accent: "accent",
  },
  {
    title: "Manage categories",
    description: "Organize the catalog taxonomy.",
    href: "/admin/categories",
    accent: "accent-2",
  },
];

function statusTone(status: "pending" | "paid" | "failed") {
  switch (status) {
    case "paid":
      return "success";
    case "failed":
      return "danger";
    default:
      return "warning";
  }
}

export default async function AdminHomePage() {
  const [products, orders] = await Promise.all([listAllProducts(), listAllOrders()]);

  const paidOrders = orders.filter((order) => order.status === "paid");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const failedOrders = orders.filter((order) => order.status === "failed");
  const lowStock = products.filter((product) => product.stock > 0 && product.stock < 5);
  const outOfStock = products.filter((product) => product.stock === 0);
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const kpis = [
    {
      label: "Total products",
      value: products.length.toString(),
      hint: `${products.filter((p) => p.active).length} active`,
      accent: "accent",
    },
    {
      label: "Pending orders",
      value: pendingOrders.length.toString(),
      hint: "Awaiting payment",
      accent: "warning",
    },
    {
      label: "Low stock",
      value: lowStock.length.toString(),
      hint: `${outOfStock.length} out of stock`,
      accent: "danger",
    },
    {
      label: "Paid orders",
      value: paidOrders.length.toString(),
      hint: `${failedOrders.length} failed`,
      accent: "success",
    },
  ];

  const recent = [...orders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-subtle)]">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--color-text)]">
              {kpi.value}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: `var(--color-${kpi.accent})` }}
            >
              {kpi.hint}
            </p>
          </div>
        ))}
      </section>

      {/* Revenue strip */}
      <section
        data-zone="dark"
        className="relative overflow-hidden rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas-2)] p-6 sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(closest-side, rgba(34,211,238,0.28), transparent)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">
              Lifetime revenue
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-[color:var(--color-text)]">
              NPR {totalRevenue.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              From {paidOrders.length} paid orders · {orders.length} total orders placed
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/70 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                Avg order
              </p>
              <p className="text-lg font-semibold text-[color:var(--color-text)]">
                NPR{" "}
                {paidOrders.length
                  ? (totalRevenue / paidOrders.length).toFixed(0)
                  : "0"}
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/70 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                Conversion
              </p>
              <p className="text-lg font-semibold text-[color:var(--color-text)]">
                {orders.length
                  ? Math.round((paidOrders.length / orders.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[color:var(--color-text)]">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4 transition hover:border-[color:var(--color-accent)]/40 hover:shadow-[0_18px_50px_-24px_rgba(34,211,238,0.35)]"
            >
              <p className="text-sm font-semibold text-[color:var(--color-text)] group-hover:text-[color:var(--color-accent)]">
                {action.title} →
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      <section className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[color:var(--color-surface-border)] p-5">
          <div>
            <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
              Recent orders
            </h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Latest 6 orders across all users.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-[color:var(--color-accent)] hover:underline"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-center text-sm text-[color:var(--color-text-muted)]">
            No orders yet.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-surface-border)]">
            {recent.map((order) => {
              const tone = statusTone(order.status);
              return (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-[color:var(--color-text)]">
                      #{order.id}
                    </p>
                    <p className="text-xs text-[color:var(--color-text-subtle)]">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[color:var(--color-text)]">
                    NPR {order.totalAmount.toFixed(2)}
                  </p>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                    style={{
                      color: `var(--color-${tone})`,
                      backgroundColor: `color-mix(in srgb, var(--color-${tone}) 15%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--color-${tone}) 30%, transparent)`,
                    }}
                  >
                    {order.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
