"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type PropsWithChildren } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

interface AdminShellProps extends PropsWithChildren {
  adminName: string;
  adminEmail: string;
}

const navGroups: {
  label: string;
  items: { href: string; label: string; icon: string }[];
}[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "grid" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: "box" },
      { href: "/admin/categories", label: "Categories", icon: "tag" },
      { href: "/admin/inventory", label: "Inventory", icon: "stack" },
    ],
  },
  {
    label: "Commerce",
    items: [{ href: "/admin/orders", label: "Orders", icon: "cart" }],
  },
  {
    label: "People",
    items: [
      { href: "/admin/profile", label: "Profile", icon: "user" },
      { href: "/admin/users", label: "Users", icon: "users" },
    ],
  },
];

export function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentTitle =
    navGroups
      .flatMap((g) => g.items)
      .find((item) =>
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
      )?.label ?? "Admin";

  return (
    <div className="relative flex min-h-dvh bg-[color:var(--color-canvas)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas-2)]",
          "flex flex-col transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-[color:var(--color-surface-border)] px-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white">
            DS
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[color:var(--color-text)]">
              Digital Store
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-warning)]">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)]">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                          active
                            ? "bg-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[color:var(--color-accent)]"
                            : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]",
                        )}
                      >
                        <NavIcon
                          name={item.icon}
                          className={cn(
                            "h-4 w-4",
                            active
                              ? "text-[color:var(--color-accent)]"
                              : "text-[color:var(--color-text-subtle)] group-hover:text-[color:var(--color-text)]",
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[color:var(--color-surface-border)] p-3">
          <div className="flex items-center gap-3 rounded-lg bg-[color:var(--color-surface-2)] p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-xs font-bold text-white">
              {adminName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[color:var(--color-text)]">
                {adminName}
              </p>
              <p className="truncate text-[11px] text-[color:var(--color-text-subtle)]">
                {adminEmail}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs font-medium text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-accent)]"
          >
            ← Back to store
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-2 w-full rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs font-medium text-[color:var(--color-danger)] transition hover:bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      ) : null}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[color:var(--color-surface-border)] bg-[color:color-mix(in_srgb,var(--color-canvas)_85%,transparent)] px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] lg:hidden"
          >
            <NavIcon name="menu" className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-text-subtle)]">
              Admin
            </p>
            <h1 className="truncate text-base font-semibold text-[color:var(--color-text)]">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden items-center gap-1.5 rounded-full border border-[color:var(--color-warning)]/30 bg-[color:color-mix(in_srgb,var(--color-warning)_12%,transparent)] px-3 py-1 text-xs font-medium text-[color:var(--color-warning)] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-warning)]" />
              Admin mode
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96 12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      );
    case "stack":
      return (
        <svg {...common}>
          <path d="m12 2 9 5-9 5-9-5 9-5z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
}
