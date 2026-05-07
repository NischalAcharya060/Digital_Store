"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils/cn";
import type { Category, ProductWithStock } from "@/types/domain";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const ALL = "__all__";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "featured" },
  { key: "price-asc", label: "price · low to high" },
  { key: "price-desc", label: "price · high to low" },
  { key: "name", label: "name" },
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
    { id: ALL, name: "all" },
    ...categories.map((c) => ({ id: c.id, name: c.name.toLowerCase() })),
  ];

  return (
    <div className="space-y-10">
      {/* Category links */}
      <div className="space-y-3">
        <p className="eyebrow">collections</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-[color:var(--color-surface-border)] pb-4">
          {chips.map((chip) => {
            const active = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveCategory(chip.id)}
                data-active={active}
                className={cn(
                  "link-underline text-sm lowercase tracking-wide transition-colors",
                  active
                    ? "text-[color:var(--color-text)]"
                    : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
                )}
              >
                {chip.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-subtle)]" />
          <input
            type="search"
            placeholder="search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full bg-transparent pl-7 pr-2 text-sm tracking-wide placeholder:text-[color:var(--color-text-subtle)] border-b border-[color:var(--color-surface-border)] text-[color:var(--color-text)] focus:border-[color:var(--color-text)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2 text-xs lowercase tracking-wide text-[color:var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-[color:var(--color-accent)]"
            />
            in stock
          </label>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none bg-transparent pr-5 text-xs lowercase tracking-wide text-[color:var(--color-text-muted)] focus:outline-none focus:text-[color:var(--color-text)]"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key} className="bg-[color:var(--color-surface)] text-[color:var(--color-text)]">
                  sort: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--color-text-subtle)]" />
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-xs lowercase tracking-[0.16em] text-[color:var(--color-text-subtle)]">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-t border-[color:var(--color-surface-border)] py-20 text-center">
          <p className="eyebrow">nothing found</p>
          <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-xl font-medium text-[color:var(--color-text)]">
            no products match this filter
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[color:var(--color-text-muted)]">
            Try a different collection, or clear the search.
          </p>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
