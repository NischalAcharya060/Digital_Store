import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { ProductWithStock } from "@/types/domain";

export function ProductCard({ product }: { product: ProductWithStock }) {
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl transition",
        "border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset,0_6px_20px_-12px_rgba(0,0,0,0.35)]",
        "hover:border-[color:var(--color-accent)]/40",
        "hover:shadow-[0_22px_60px_-20px_rgba(34,211,238,0.25)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-surface-2)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.55))] opacity-70" />
        <div className="absolute left-3 top-3">
          <Badge
            label={product.categoryName ?? "Digital"}
            variant="accent"
            className="backdrop-blur"
          />
        </div>
        {!inStock ? (
          <div className="absolute right-3 top-3">
            <Badge label="Sold out" variant="danger" className="backdrop-blur" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-[color:var(--color-text)]">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-[color:var(--color-text-muted)]">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-subtle)]">
              From
            </p>
            <p className="text-base font-bold text-[color:var(--color-text)]">
              NPR {product.price.toFixed(2)}
            </p>
          </div>
          {inStock ? (
            <Badge label={`${product.stock} left`} variant="success" />
          ) : null}
        </div>
      </div>
    </Link>
  );
}
