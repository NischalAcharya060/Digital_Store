import Link from "next/link";

export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-zone="dark"
      className="mt-12 border-t border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas)]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white">
              DS
            </span>
            <span className="text-base font-semibold text-[color:var(--color-text)]">
              Digital Store
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-[color:var(--color-text-muted)]">
            Nepal&apos;s fastest way to top up games, redeem gift cards, and unlock
            subscriptions. Instant delivery backed by secure eSewa and Khalti payments.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-subtle)]">
            Store
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-text-muted)]">
            <li>
              <Link href="/products" className="hover:text-[color:var(--color-accent)]">
                All products
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-[color:var(--color-accent)]">
                Track orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[color:var(--color-accent)]">
                Your cart
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[color:var(--color-accent)]">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-subtle)]">
            We accept
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PaymentPill label="eSewa" accent="#60bb46" />
            <PaymentPill label="Khalti" accent="#5c2d91" />
            <PaymentPill label="IME Pay" accent="#e11d48" />
            <PaymentPill label="Fonepay" accent="#2563eb" />
          </div>
          <p className="mt-4 text-xs text-[color:var(--color-text-subtle)]">
            24 × 7 instant delivery for verified stock.
          </p>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-surface-border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[color:var(--color-text-subtle)] sm:flex-row sm:px-6">
          <p>© {year} Digital Store. All rights reserved.</p>
          <p>Made in Nepal for gamers &amp; dreamers.</p>
        </div>
      </div>
    </footer>
  );
}

function PaymentPill({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-3 py-1 text-xs font-medium text-[color:var(--color-text)]"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
      />
      {label}
    </span>
  );
}
