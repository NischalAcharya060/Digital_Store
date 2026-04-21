"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils/cn";
import type { Category, ProductWithStock } from "@/types/domain";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const ALL = "__all__";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name" },
];

interface Props {
  products: ProductWithStock[];
  categories: Category[];
  initialCategoryId?: string;
}

export function ProductsBrowser({ products, categories, initialCategoryId }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategoryId ?? ALL);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;

    if (activeCategory !== ALL) {
      list = list.filter((p) => p.categoryId === activeCategory);
    }
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.categoryName ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, activeCategory, inStockOnly, query, sort]);

  const chips: { id: string; name: string }[] = [
    { id: ALL, name: "All" },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-subtle)]" />
            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "h-10 w-full rounded-full pl-9 pr-4 text-sm transition",
                "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]",
                "border border-[color:var(--color-surface-border)]",
                "placeholder:text-[color:var(--color-text-subtle)]",
                "focus:outline-none focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/25",
              )}
            />
          </div>

          <label
            className={cn(
              "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-medium transition",
              inStockOnly
                ? "border-[color:var(--color-accent)]/50 bg-[color:color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[color:var(--color-accent)]"
                : "border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
            )}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="sr-only"
            />
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                inStockOnly
                  ? "bg-[color:var(--color-accent)]"
                  : "bg-[color:var(--color-text-subtle)]",
              )}
            />
            In stock only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[color:var(--color-text-subtle)]">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={cn(
              "h-10 rounded-full px-3 text-sm transition",
              "bg-[color:var(--color-surface)] text-[color:var(--color-text)]",
              "border border-[color:var(--color-surface-border)]",
              "focus:outline-none focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/25",
            )}
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {chips.map((chip) => {
          const active = chip.id === activeCategory;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveCategory(chip.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                active
                  ? "border-[color:var(--color-accent)]/50 bg-[color:color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[color:var(--color-accent)]"
                  : "border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      {/* Result summary */}
      <div className="flex items-center justify-between text-xs text-[color:var(--color-text-subtle)]">
        <span>
          Showing <span className="font-semibold text-[color:var(--color-text)]">{filtered.length}</span>{" "}
          of {products.length} products
        </span>
        {(activeCategory !== ALL || inStockOnly || query) && (
          <button
            type="button"
            onClick={() => {
              setActiveCategory(ALL);
              setInStockOnly(false);
              setQuery("");
            }}
            className="font-medium text-[color:var(--color-accent)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-12 text-center">
          <p className="text-sm font-medium text-[color:var(--color-text)]">
            No products match your filters
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
            Try a different category or clear the search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
