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
    <div className="space-y-14">
      <header className="max-w-3xl space-y-5 border-b border-[color:var(--color-surface-border)] pb-12">
        <p className="eyebrow">the shop</p>
        <h1 className="font-[family-name:var(--font-poppins)] text-4xl font-medium tracking-[-0.025em] text-[color:var(--color-text)] sm:text-5xl">
          All products
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-text-muted)]">
          Every digital product we carry, in one place. Filter by collection,
          search by keyword, or sort by price. Codes are delivered the moment
          payment clears.
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
