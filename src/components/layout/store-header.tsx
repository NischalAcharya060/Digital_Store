"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Store" },
  { href: "/orders", label: "Orders" },
];

export function StoreHeader() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === "admin";
  const isAdminRoute = pathname.startsWith("/admin");

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-xl",
        "border-[color:var(--color-surface-border)]",
        "bg-[color:color-mix(in_srgb,var(--color-canvas)_80%,transparent)]",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(34,211,238,0.55)]">
            DS
          </span>
          <span className="hidden text-[color:var(--color-text)] sm:inline">Digital Store</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 transition",
                  active
                    ? "bg-[color:color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[color:var(--color-accent)]"
                    : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              className={cn(
                "rounded-full px-3 py-1.5 transition",
                isAdminRoute
                  ? "bg-[color:color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[color:var(--color-warning)]"
                  : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-warning)]",
              )}
            >
              Admin
            </Link>
          ) : null}
        </nav>

        {/* Search — visual stub */}
        <div className="ml-auto hidden flex-1 max-w-sm lg:block">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-subtle)]" />
            <input
              type="search"
              placeholder="Search games, gift cards, subscriptions..."
              className={cn(
                "h-10 w-full rounded-full pl-9 pr-4 text-sm transition",
                "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]",
                "border border-[color:var(--color-surface-border)]",
                "placeholder:text-[color:var(--color-text-subtle)]",
                "focus:outline-none focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/25",
              )}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeToggle />

          <Link
            href="/cart"
            aria-label="Cart"
            className={cn(
              "relative inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition",
              "border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]",
              "hover:border-[color:var(--color-accent)]/40 hover:text-[color:var(--color-accent)]",
            )}
          >
            <CartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-[10px] font-semibold text-[color:var(--color-text-inverse)]">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="max-w-[8rem] truncate text-xs text-[color:var(--color-text-subtle)]">
                {profile?.name ?? user.email}
              </span>
              <Button size="sm" variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button size="sm" variant="gradient">
                Login
              </Button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden",
              "border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]",
            )}
          >
            {mobileOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="border-t border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas)] md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-[color:color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[color:var(--color-accent)]"
                      : "text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-2)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm text-[color:var(--color-warning)] hover:bg-[color:var(--color-surface-2)]"
              >
                Admin
              </Link>
            ) : null}
            {user ? (
              <button
                onClick={logout}
                className="mt-1 rounded-lg px-3 py-2 text-left text-sm text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)]"
              >
                Logout ({profile?.name ?? user.email})
              </button>
            ) : (
              <Link
                href="/login"
                className="mt-1 rounded-lg bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))] px-3 py-2 text-center text-sm font-medium text-white"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
