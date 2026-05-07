import Link from "next/link";

import { FirebaseConfigAlert } from "@/components/layout/firebase-config-alert";
import { isFirestoreDatabaseNotFoundError } from "@/lib/firebase/errors";
import { ProductCard } from "@/components/products/product-card";
import { listActiveProducts } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

const collections = [
  { label: "game top-ups", href: "/products?category=games" },
  { label: "gift cards", href: "/products?category=gift-cards" },
  { label: "subscriptions", href: "/products?category=subscriptions" },
  { label: "mobile recharge", href: "/products?category=recharge" },
  { label: "software keys", href: "/products?category=software" },
];

const perks = [
  { eyebrow: "01", title: "Instant delivery", description: "Codes land in your inbox the moment payment clears." },
  { eyebrow: "02", title: "Nepali payments", description: "Pay with eSewa or Khalti. No card, no friction." },
  { eyebrow: "03", title: "Verified stock", description: "Every code is tested before it reaches you." },
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
    <div className="space-y-24">
      {/* HERO — editorial, full-bleed within shop container */}
      <section className="-mx-4 -my-8 bg-[color:var(--color-canvas-2)] sm:-mx-6 lg:-mx-8">
        <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-between gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[color:var(--color-text)]" />
            <p className="eyebrow text-[color:var(--color-text-muted)]">est. kathmandu</p>
          </div>

          <div className="max-w-4xl">
            <h1 className="h-display text-[color:var(--color-text)]">
              Digital
              <br />
              essentials,
              <br />
              <span className="italic font-light text-[color:var(--color-accent-2)]">curated.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-[color:var(--color-text-muted)] sm:text-lg">
              A small, considered shop for game top-ups, gift cards and
              subscriptions. Pay with eSewa or Khalti, receive your codes in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 border-b border-[color:var(--color-text)] pb-1 text-sm lowercase tracking-[0.18em] text-[color:var(--color-text)] transition hover:gap-4"
            >
              explore the shop
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="#featured"
              className="text-sm lowercase tracking-[0.18em] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
            >
              what&apos;s new
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">featured</p>
            <h2 className="h-section mt-3 text-[color:var(--color-text)]">
              A few favourites this week
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm lowercase tracking-[0.16em] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] sm:inline-flex sm:items-center sm:gap-2"
          >
            view all <span aria-hidden>→</span>
          </Link>
        </div>
        <hr className="divider-rule mt-6" />

        {featured.length === 0 ? (
          <div className="mt-12 border border-dashed border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-16 text-center">
            <p className="eyebrow">empty shelf</p>
            <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
              New drops land weekly. Check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* COLLECTIONS */}
      <section>
        <div>
          <p className="eyebrow">browse by</p>
          <h2 className="h-section mt-3 text-[color:var(--color-text)]">Collections</h2>
        </div>
        <hr className="divider-rule mt-6" />

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
          {collections.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="link-underline font-[family-name:var(--font-poppins)] text-2xl font-light tracking-[-0.015em] text-[color:var(--color-text)] hover:text-[color:var(--color-accent-2)] sm:text-3xl"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="border-t border-[color:var(--color-surface-border)] pt-16">
        <div className="grid gap-12 sm:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title}>
              <p className="font-[family-name:var(--font-poppins)] text-3xl font-light text-[color:var(--color-text-subtle)]">
                {perk.eyebrow}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-poppins)] text-base font-medium tracking-[-0.012em] text-[color:var(--color-text)]">
                {perk.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
                {perk.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
