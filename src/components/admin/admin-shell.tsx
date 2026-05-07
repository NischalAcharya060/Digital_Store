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
    label: "overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "grid" }],
  },
  {
    label: "catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: "box" },
      { href: "/admin/categories", label: "Categories", icon: "tag" },
      { href: "/admin/inventory", label: "Inventory", icon: "stack" },
    ],
  },
  {
    label: "commerce",
    items: [{ href: "/admin/orders", label: "Orders", icon: "cart" }],
  },
  {
    label: "people",
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
    <div className="flex min-h-screen bg-[color:var(--color-canvas)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas)] transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center border-b border-[color:var(--color-surface-border)] px-6">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-poppins)] text-lg font-medium tracking-[-0.02em] text-[color:var(--color-text)] lowercase">
              digitalstore
            </span>
            <span className="text-[0.625rem] uppercase tracking-[0.18em] text-[color:var(--color-text-subtle)]">
              admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="eyebrow mb-2 px-3">{group.label}</p>
              <ul className="space-y-px">
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
                          "group relative flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                          active
                            ? "text-[color:var(--color-text)]"
                            : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
                        )}
                      >
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-[color:var(--color-accent)]"
                          />
                        ) : null}
                        <NavIcon
                          name={item.icon}
                          className={cn(
                            "h-4 w-4",
                            active
                              ? "text-[color:var(--color-text)]"
                              : "text-[color:var(--color-text-subtle)] group-hover:text-[color:var(--color-text)]",
                          )}
                        />
                        <span className="tracking-tight">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[color:var(--color-surface-border)] p-4">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] text-xs font-medium text-[color:var(--color-text)]">
              {adminName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[color:var(--color-text)]">
                {adminName}
              </p>
              <p className="truncate text-xs text-[color:var(--color-text-subtle)]">
                {adminEmail}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs lowercase tracking-wide">
            <Link
              href="/"
              className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
            >
              ← back to store
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-danger)]"
            >
              sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[color:var(--color-surface-border)] bg-[color:color-mix(in_srgb,var(--color-canvas)_92%,transparent)] px-6 backdrop-blur-xl">
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[0.625rem]">admin · {currentTitle.toLowerCase()}</p>
            <h1 className="truncate font-[family-name:var(--font-poppins)] text-base font-medium tracking-[-0.012em] text-[color:var(--color-text)]">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden items-center gap-2 border border-[color:var(--color-surface-border)] px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-muted)] sm:inline-flex">
              <span className="h-1 w-1 rounded-full bg-[color:var(--color-accent-2)]" />
              admin mode
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden bg-[color:var(--color-canvas)] p-6 lg:p-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
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
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
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
          <path d="M5 7h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 7Z" />
          <path d="M9 7V5a3 3 0 0 1 6 0v2" />
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
