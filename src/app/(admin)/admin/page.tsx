import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { listAllProducts } from "@/services/catalog.service";
import { listAllOrders } from "@/services/order.service";

const quickActions = [
  {
    title: "Add product",
    description: "Publish a new digital item.",
    href: "/admin/products",
  },
  {
    title: "Upload inventory",
    description: "Paste codes to refill stock.",
    href: "/admin/inventory",
  },
  {
    title: "Review orders",
    description: "Track pending and paid orders.",
    href: "/admin/orders",
  },
  {
    title: "Manage categories",
    description: "Organize the catalog.",
    href: "/admin/categories",
  },
];

function statusVariant(status: "pending" | "paid" | "failed") {
  switch (status) {
    case "paid":
      return "success" as const;
    case "failed":
      return "danger" as const;
    default:
      return "warning" as const;
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
  const avgOrder = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const conversion = orders.length
    ? Math.round((paidOrders.length / orders.length) * 100)
    : 0;

  const kpis = [
    {
      label: "products",
      value: products.length.toString(),
      hint: `${products.filter((p) => p.active).length} active`,
    },
    {
      label: "pending orders",
      value: pendingOrders.length.toString(),
      hint: "awaiting payment",
    },
    {
      label: "low stock",
      value: lowStock.length.toString(),
      hint: `${outOfStock.length} out of stock`,
    },
    {
      label: "paid orders",
      value: paidOrders.length.toString(),
      hint: `${failedOrders.length} failed`,
    },
  ];

  const recent = [...orders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-12">
      {/* PAGE HEADER */}
      <header className="flex items-end justify-between border-b border-[color:var(--color-surface-border)] pb-8">
        <div>
          <p className="eyebrow">overview</p>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-3xl font-medium tracking-[-0.02em] text-[color:var(--color-text)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            A snapshot of the catalog and recent orders.
          </p>
        </div>
      </header>

      {/* KPI strip */}
      <section className="grid divide-y divide-[color:var(--color-surface-border)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="p-6">
            <p className="eyebrow">{kpi.label}</p>
            <p className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-medium tabular-nums tracking-tight text-[color:var(--color-text)]">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs lowercase tracking-wide text-[color:var(--color-text-subtle)]">
              {kpi.hint}
            </p>
          </div>
        ))}
      </section>

      {/* Revenue */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-8 lg:col-span-2">
          <p className="eyebrow">lifetime revenue</p>
          <p className="mt-4 font-[family-name:var(--font-poppins)] text-5xl font-medium tabular-nums tracking-[-0.025em] text-[color:var(--color-text)]">
            NPR {totalRevenue.toFixed(2)}
          </p>
          <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
            From {paidOrders.length} paid · {orders.length} total orders placed.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <div className="border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6">
            <p className="eyebrow">avg order</p>
            <p className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-medium tabular-nums tracking-tight text-[color:var(--color-text)]">
              NPR {avgOrder.toFixed(0)}
            </p>
          </div>
          <div className="border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6">
            <p className="eyebrow">conversion</p>
            <p className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-medium tabular-nums tracking-tight text-[color:var(--color-text)]">
              {conversion}%
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <p className="eyebrow">quick actions</p>
        <hr className="divider-rule mt-3" />
        <div className="mt-6 grid gap-px border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-border)] sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-2 bg-[color:var(--color-surface)] p-6 transition-colors hover:bg-[color:var(--color-surface-2)]"
            >
              <p className="font-[family-name:var(--font-poppins)] text-base font-medium tracking-[-0.012em] text-[color:var(--color-text)]">
                {action.title}
              </p>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                {action.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs lowercase tracking-[0.16em] text-[color:var(--color-text-subtle)] group-hover:text-[color:var(--color-text)]">
                open
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      <section className="border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="flex items-end justify-between border-b border-[color:var(--color-surface-border)] p-6">
          <div>
            <p className="eyebrow">recent orders</p>
            <h2 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-medium tracking-[-0.015em] text-[color:var(--color-text)]">
              Latest activity
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs lowercase tracking-[0.16em] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
          >
            view all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center text-sm text-[color:var(--color-text-muted)]">
            No orders yet.
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-surface-border)]">
            {recent.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--color-surface-2)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-[color:var(--color-text)]">
                    #{order.id}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-subtle)]">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="font-[family-name:var(--font-poppins)] text-sm font-medium tabular-nums text-[color:var(--color-text)]">
                  NPR {order.totalAmount.toFixed(2)}
                </p>
                <Badge label={order.status} variant={statusVariant(order.status)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
