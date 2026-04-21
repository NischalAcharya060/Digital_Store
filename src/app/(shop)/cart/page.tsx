import { CartPageClient } from "@/components/cart/cart-page-client";

export default function CartPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-[var(--color-primary)]">Your Cart</h1>
      <CartPageClient />
    </div>
  );
}
