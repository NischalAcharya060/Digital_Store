import { FirebaseConfigAlert } from "@/components/layout/firebase-config-alert";
import { isFirestoreDatabaseNotFoundError } from "@/lib/firebase/errors";
import { ProductsBrowser } from "@/components/products/products-browser";
import { listActiveProducts, listCategories } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
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

  const { category } = await searchParams;

  let products;
  let categories;

  try {
    [products, categories] = await Promise.all([
      listActiveProducts(),
      listCategories(),
    ]);
  } catch (error) {
    if (isFirestoreDatabaseNotFoundError(error)) {
      return <FirebaseConfigAlert mode="database-not-found" />;
    }
    throw error;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">
          Store
        </p>
        <h1 className="text-3xl font-bold text-[color:var(--color-text)] sm:text-4xl">
          All products
        </h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-muted)]">
          Browse gift cards, gaming top-ups, and subscriptions. Filter by category,
          search by keyword, or sort by price — all delivered instantly after payment.
        </p>
      </header>

      <ProductsBrowser
        products={products}
        categories={categories}
        initialCategoryId={category}
      />
    </div>
  );
}
