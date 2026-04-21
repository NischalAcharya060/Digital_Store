import Link from "next/link";

import { FirebaseConfigAlert } from "@/components/layout/firebase-config-alert";
import { isFirestoreDatabaseNotFoundError } from "@/lib/firebase/errors";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { listActiveProducts } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

const categoryChips = [
  { label: "Game Top-ups", href: "/products?category=games", accent: "accent" },
  { label: "Gift Cards", href: "/products?category=gift-cards", accent: "accent-2" },
  { label: "Subscriptions", href: "/products?category=subscriptions", accent: "accent" },
  { label: "Mobile Recharge", href: "/products?category=recharge", accent: "accent-2" },
  { label: "Software Keys", href: "/products?category=software", accent: "accent" },
];

const perks = [
  {
    title: "Instant delivery",
    description: "Codes land in your inbox the moment payment clears.",
    icon: "⚡",
  },
  {
    title: "Nepali payments",
    description: "Pay with eSewa or Khalti. No card, no friction.",
    icon: "₨",
  },
  {
    title: "Verified stock",
    description: "Every code is tested before it reaches you.",
    icon: "✓",
  },
];

export default async function Home() {
  const hasProjectId = Boolean(
    process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT,
  );

  if (!hasProjectId) {
    return <FirebaseConfigAlert />;
  }

  let products;

  try {
    products = await listActiveProducts();
  } catch (error) {
    if (isFirestoreDatabaseNotFoundError(error)) {
      return <FirebaseConfigAlert mode="database-not-found" />;
    }

    throw error;
  }

  const featured = products.slice(0, 8);

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section
        data-zone="dark"
        className="relative overflow-hidden rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-canvas-2)] p-8 sm:p-12"
      >
        {/* Ambient gradient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(168,85,247,0.35), transparent)",
          }}
        />

        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-accent)]" />
              Live stock · Delivered in seconds
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[color:var(--color-text)] sm:text-4xl md:text-5xl">
              Top up your game. <br />
              <span className="text-gradient">Level up instantly.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-[color:var(--color-text-muted)] sm:text-base">
              PUBG UC, Free Fire diamonds, Netflix, Spotify, Apple & Google Play
              gift cards — delivered the moment eSewa or Khalti confirms your
              payment.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products">
                <Button variant="gradient" size="lg">
                  Browse store
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="secondary" size="lg">
                  Track my orders
                </Button>
              </Link>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-md sm:text-left">
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                  Avg delivery
                </dt>
                <dd className="mt-1 text-base font-semibold text-[color:var(--color-text)]">
                  &lt; 30s
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                  Orders served
                </dt>
                <dd className="mt-1 text-base font-semibold text-[color:var(--color-text)]">
                  12k+
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                  Support
                </dt>
                <dd className="mt-1 text-base font-semibold text-[color:var(--color-text)]">
                  24 × 7
                </dd>
              </div>
            </dl>
          </div>

          {/* Decorative product stack */}
          <div className="relative hidden aspect-square max-w-md justify-self-end md:block">
            <div className="absolute inset-0 rotate-[-6deg] rounded-2xl border border-[color:var(--color-surface-border)] bg-[linear-gradient(135deg,rgba(34,211,238,0.25),rgba(168,85,247,0.25))]" />
            <div className="absolute inset-6 rotate-[4deg] rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
              <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">
                Gift card
              </p>
              <p className="mt-2 text-xl font-bold text-[color:var(--color-text)]">
                Apple · $50
              </p>
              <div className="mt-6 h-28 rounded-xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))]" />
              <div className="mt-4 flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                <span>NPR 6,850</span>
                <span className="rounded-full bg-[color:var(--color-surface-2)] px-2 py-0.5">
                  In stock
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
            Shop by category
          </h2>
          <Link
            href="/products"
            className="text-xs font-medium text-[color:var(--color-accent)] hover:underline"
          >
            See all →
          </Link>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {categoryChips.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              className="shrink-0 rounded-full border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)] transition hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-accent)]"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED GRID */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text)] sm:text-2xl">
              Featured right now
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Hand-picked by the team. New drops every week.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-[color:var(--color-accent)] hover:underline sm:block"
          >
            View all products →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-10 text-center text-sm text-[color:var(--color-text-muted)]">
            No products yet. Check back soon — new drops land weekly.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* PERKS STRIP */}
      <section className="grid gap-4 sm:grid-cols-3">
        {perks.map((perk) => (
          <div
            key={perk.title}
            className="flex items-start gap-3 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-base font-bold text-white">
              {perk.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-[color:var(--color-text)]">
                {perk.title}
              </p>
              <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                {perk.description}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
