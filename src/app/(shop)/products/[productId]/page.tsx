import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { FirebaseConfigAlert } from "@/components/layout/firebase-config-alert";
import { isFirestoreDatabaseNotFoundError } from "@/lib/firebase/errors";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { getProductById } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const hasProjectId = Boolean(
    process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT,
  );

  if (!hasProjectId) {
    return <FirebaseConfigAlert />;
  }

  const { productId } = await params;
  let product;

  try {
    product = await getProductById(productId);
  } catch (error) {
    if (isFirestoreDatabaseNotFoundError(error)) {
      return <FirebaseConfigAlert mode="database-not-found" />;
    }
    throw error;
  }

  if (!product || !product.active) {
    notFound();
  }

  const inStock = product.stock > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-[color:var(--color-text-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-accent)]">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link href="/products" className="hover:text-[color:var(--color-accent)]">
          Products
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-[color:var(--color-text-muted)]">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Media + description */}
        <section className="space-y-6">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.55))]" />
            <div className="absolute left-4 top-4">
              <Badge
                label={product.categoryName ?? "Digital"}
                variant="accent"
                className="backdrop-blur"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6">
            <h1 className="text-2xl font-bold text-[color:var(--color-text)] sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
              {product.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile title="Delivery" value="Instant" hint="Codes emailed after payment" />
              <InfoTile title="Region" value="Global" hint="Works worldwide unless noted" />
              <InfoTile title="Support" value="24 × 7" hint="Chat & email support" />
            </div>
          </div>
        </section>

        {/* Buy panel */}
        <aside className="h-fit space-y-4 rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 lg:sticky lg:top-20">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-subtle)]">
              Price
            </p>
            <p className="text-3xl font-bold text-[color:var(--color-text)]">
              NPR {product.price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs">
            <span className="text-[color:var(--color-text-muted)]">Availability</span>
            <Badge
              label={inStock ? `${product.stock} in stock` : "Out of stock"}
              variant={inStock ? "success" : "danger"}
            />
          </div>

          <AddToCartButton product={product} />

          <div className="space-y-2 border-t border-[color:var(--color-surface-border)] pt-4 text-xs text-[color:var(--color-text-muted)]">
            <FeatureRow icon="⚡" text="Codes delivered within seconds of payment" />
            <FeatureRow icon="🔒" text="Verified stock — every code pre-tested" />
            <FeatureRow icon="₨" text="Pay with eSewa or Khalti" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-3">
      <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--color-text)]">{value}</p>
      <p className="mt-0.5 text-[11px] text-[color:var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[color:var(--color-surface-2)] text-xs">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
