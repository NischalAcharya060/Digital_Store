import Link from "next/link";

export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Wordmark + tagline */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="font-[family-name:var(--font-poppins)] text-2xl font-medium tracking-[-0.025em] text-[color:var(--color-text)]"
            >
              digitalstore<span className="text-[0.625rem] uppercase tracking-[0.2em] text-[color:var(--color-text-subtle)]"> np</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[color:var(--color-text-muted)]">
              A curated shop for digital essentials in Nepal — game top-ups,
              gift cards and subscriptions, delivered the moment payment clears.
            </p>
            <p className="eyebrow mt-8">stay in the loop</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[color:var(--color-text-muted)]">
              New drops every Friday. Email{" "}
              <a
                href="mailto:hello@digitalstore.np"
                className="text-[color:var(--color-text)] underline decoration-[color:var(--color-surface-border-strong)] underline-offset-4 hover:decoration-[color:var(--color-text)]"
              >
                hello@digitalstore.np
              </a>{" "}
              to be first to know.
            </p>
          </div>

          {/* Link columns */}
          <FooterColumn
            label="shop"
            links={[
              { href: "/products", label: "all products" },
              { href: "/products?category=games", label: "games" },
              { href: "/products?category=gift-cards", label: "gift cards" },
              { href: "/products?category=subscriptions", label: "subscriptions" },
            ]}
            className="md:col-span-2"
          />
          <FooterColumn
            label="support"
            links={[
              { href: "/orders", label: "track order" },
              { href: "/cart", label: "your cart" },
              { href: "/support", label: "help centre" },
              { href: "/contact", label: "contact" },
            ]}
            className="md:col-span-2"
          />
          <FooterColumn
            label="company"
            links={[
              { href: "/about", label: "about" },
              { href: "/privacy", label: "privacy" },
              { href: "/terms", label: "terms" },
              { href: "/login", label: "sign in" },
            ]}
            className="md:col-span-2"
          />
        </div>
      </div>

      <div className="border-t border-[color:var(--color-surface-border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs tracking-wide text-[color:var(--color-text-subtle)]">
            © {year} digitalstore. all rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-subtle)]">
            <span>esewa</span>
            <span className="text-[color:var(--color-surface-border-strong)]">·</span>
            <span>khalti</span>
            <span className="text-[color:var(--color-surface-border-strong)]">·</span>
            <span>ime pay</span>
            <span className="text-[color:var(--color-surface-border-strong)]">·</span>
            <span>fonepay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  label,
  links,
  className,
}: {
  label: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{label}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="lowercase tracking-wide text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
