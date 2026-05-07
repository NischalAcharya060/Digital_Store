import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import type { ProductWithStock } from "@/types/domain";

export function ProductCard({ product }: { product: ProductWithStock }) {
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock < 5;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col gap-4"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--color-surface-2)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-[1.03]",
            !inStock && "opacity-70 grayscale-[20%]",
          )}
        />
        {!inStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-[color:var(--color-canvas)]/90 py-2 text-center text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[color:var(--color-text)] backdrop-blur-sm">
            sold out
          </div>
        ) : null}
        {lowStock ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-[color:var(--color-canvas)]/90 px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent-2)] backdrop-blur-sm">
            <span className="h-1 w-1 rounded-full bg-[color:var(--color-accent-2)]" />
            only {product.stock} left
          </div>
        ) : null}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col">
        <p className="eyebrow">
          {product.categoryName ?? "digital"}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-poppins)] text-base font-medium leading-tight tracking-[-0.012em] text-[color:var(--color-text)] transition-colors group-hover:text-[color:var(--color-accent-2)]">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
          {product.description}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="font-[family-name:var(--font-poppins)] text-base font-medium tracking-tight text-[color:var(--color-text)]">
            NPR {product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
