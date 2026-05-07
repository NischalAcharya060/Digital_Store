"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

const baseLinks = [
  { href: "/", label: "home" },
  { href: "/products", label: "shop" },
];

export function StoreHeader() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const links = user ? [...baseLinks, { href: "/orders", label: "orders" }] : baseLinks;

  const isAdmin =
    profile?.role === "admin" ||
    profile?.role === "super_admin" ||
    profile?.role === "moderator";
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 backdrop-blur-xl",
        "border-b border-[color:var(--color-surface-border)]",
        "bg-[color:color-mix(in_srgb,var(--color-canvas)_92%,transparent)]",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex shrink-0 items-baseline gap-1 font-[family-name:var(--font-poppins)] text-[1.25rem] font-medium tracking-[-0.02em] text-[color:var(--color-text)]"
        >
          <span className="lowercase">digitalstore</span>
          <span className="text-[0.625rem] uppercase tracking-[0.2em] text-[color:var(--color-text-subtle)]">
            np
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {links.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className={cn(
                  "link-underline lowercase tracking-wide transition-colors",
                  active
                    ? "text-[color:var(--color-text)]"
                    : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              data-active={isAdminRoute}
              className={cn(
                "link-underline lowercase tracking-wide transition-colors",
                isAdminRoute
                  ? "text-[color:var(--color-text)]"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
              )}
            >
              admin
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Search */}
          <div className="hidden items-center md:flex">
            {searchOpen ? (
              <div className="relative flex items-center">
                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-subtle)]" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="search the shop"
                  onBlur={(e) => {
                    if (!e.currentTarget.value) setSearchOpen(false);
                  }}
                  className={cn(
                    "h-9 w-56 bg-transparent pl-7 pr-2 text-sm tracking-wide placeholder:text-[color:var(--color-text-subtle)]",
                    "border-b border-[color:var(--color-surface-border)] text-[color:var(--color-text)]",
                    "focus:border-[color:var(--color-text)] focus:outline-none",
                  )}
                />
              </div>
            ) : (
              <button
                type="button"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              >
                <SearchIcon className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>

          <ThemeToggle />

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
            )}
          >
            <CartIcon className="h-[18px] w-[18px]" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-canvas)] px-1 text-[10px] font-semibold leading-none text-[color:var(--color-text)]">
                {count}
              </span>
            ) : null}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="ml-2 hidden items-center gap-3 md:flex">
              <Link
                href="/profile"
                className="text-xs lowercase tracking-wide text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              >
                {profile?.name?.split(" ")[0]?.toLowerCase() ?? "profile"}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-xs lowercase tracking-wide text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text)]"
              >
                sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="ml-2 hidden md:block">
              <Button size="sm" variant="primary" className="lowercase tracking-wide">
                sign in
              </Button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className={cn(
              "ml-1 inline-flex h-9 w-9 items-center justify-center text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] md:hidden",
            )}
          >
            {mobileOpen ? <CloseIcon className="h-[18px] w-[18px]" /> : <MenuIcon className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="border-t border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas)] md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            <div className="relative mb-2">
              <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-subtle)]" />
              <input
                type="search"
                placeholder="search"
                className="h-10 w-full bg-transparent pl-8 pr-2 text-sm border-b border-[color:var(--color-surface-border)] focus:border-[color:var(--color-text)] focus:outline-none"
              />
            </div>
            {links.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-1 py-3 text-sm lowercase tracking-wide transition border-b border-[color:var(--color-surface-border)]",
                    active
                      ? "text-[color:var(--color-text)]"
                      : "text-[color:var(--color-text-muted)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-1 py-3 text-sm lowercase tracking-wide text-[color:var(--color-text-muted)] border-b border-[color:var(--color-surface-border)]"
              >
                admin
              </Link>
            ) : null}
            {user ? (
              <div className="mt-4 flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs lowercase tracking-wide text-[color:var(--color-text-muted)]"
                >
                  {profile?.name ?? user.email}
                </Link>
                <button
                  onClick={() => void logout()}
                  className="text-xs lowercase tracking-wide text-[color:var(--color-text-subtle)]"
                >
                  sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex h-10 items-center justify-center bg-[color:var(--color-accent)] text-sm lowercase tracking-wide text-[color:var(--color-text-inverse)]"
              >
                sign in
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 7h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="13" x2="20" y2="13" />
      <line x1="4" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
