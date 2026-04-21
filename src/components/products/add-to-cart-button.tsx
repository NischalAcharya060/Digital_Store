"use client";

import { useState } from "react";

import { useCart } from "@/hooks/use-cart";
import type { ProductWithStock } from "@/types/domain";

import { Button } from "@/components/ui/button";

export function AddToCartButton({ product }: { product: ProductWithStock }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      disabled={product.stock < 1}
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      fullWidth
    >
      {product.stock < 1 ? "Out of stock" : added ? "Added" : "Add to cart"}
    </Button>
  );
}
