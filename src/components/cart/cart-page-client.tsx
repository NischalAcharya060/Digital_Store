"use client";

import Link from "next/link";

import { useCart } from "@/hooks/use-cart";

import { Button } from "@/components/ui/button";

export function CartPageClient() {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-xl border border-dashed border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-10 text-center">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Your cart is empty</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Add gift cards or game credits to start checkout.
        </p>
        <Link href="/products">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.productId}
            className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[color:var(--color-text)]">{item.name}</h3>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  NPR {item.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  className="h-10 w-20 rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] px-2 text-[color:var(--color-text)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/25"
                  min={1}
                  max={20}
                  type="number"
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(item.productId, Number(event.target.value))
                  }
                />
                <Button variant="ghost" onClick={() => removeItem(item.productId)}>
                  Remove
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Order Summary</h2>
        <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">Total</p>
        <p className="text-2xl font-semibold text-[color:var(--color-text)]">
          NPR {total.toFixed(2)}
        </p>
        <Link href="/checkout" className="mt-4 block">
          <Button fullWidth>Proceed to checkout</Button>
        </Link>
      </aside>
    </div>
  );
}
