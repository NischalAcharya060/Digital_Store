"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithStock } from "@/types/domain";

export function AdminInventoryClient() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [productId, setProductId] = useState("");
  const [codesText, setCodesText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  async function loadProducts() {
    setLoadingList(true);
    try {
      const response = await fetch("/api/admin/products");
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to load products");
      }
      setProducts(body.data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const codeCount = useMemo(
    () => codesText.split("\n").map((s) => s.trim()).filter(Boolean).length,
    [codesText],
  );

  const selected = products.find((p) => p.id === productId);

  async function submit() {
    if (!productId || !codesText.trim()) {
      setError("Pick a product and paste at least one code.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const codes = codesText
        .split("\n")
        .map((code) => code.trim())
        .filter(Boolean);

      const response = await fetch("/api/admin/inventory/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, codes }),
      });

      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Inventory upload failed");
      }

      setCodesText("");
      setMessage(`${body.data.createdCount} new codes uploaded.`);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inventory upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
        <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
          Bulk code upload
        </h2>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
          Paste one digital code per line. Duplicates are skipped automatically.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <label className="flex flex-col gap-1.5 text-sm text-[color:var(--color-text-muted)]">
              <span className="font-medium text-[color:var(--color-text)]">Product</span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="h-11 rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 text-sm text-[color:var(--color-text)] transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — stock {p.stock}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-[color:var(--color-text-muted)]">
              <span className="flex items-center justify-between font-medium text-[color:var(--color-text)]">
                <span>Codes (one per line)</span>
                <span className="text-[11px] font-normal text-[color:var(--color-text-subtle)]">
                  {codeCount} code{codeCount === 1 ? "" : "s"} detected
                </span>
              </span>
              <textarea
                rows={10}
                className="resize-y rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 py-2 font-mono text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30"
                placeholder="XXXX-XXXX-XXXX-AAAA&#10;XXXX-XXXX-XXXX-BBBB&#10;XXXX-XXXX-XXXX-CCCC"
                value={codesText}
                onChange={(e) => setCodesText(e.target.value)}
              />
            </label>

            {message ? (
              <p className="rounded-lg border border-[color:var(--color-success)]/30 bg-[color:color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--color-success)]">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--color-danger)]">
                {error}
              </p>
            ) : null}

            <Button disabled={loading} onClick={submit}>
              {loading ? "Uploading..." : `Upload ${codeCount || ""} codes`.trim()}
            </Button>
          </div>

          {/* Side preview */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-subtle)]">
              Selected
            </p>
            {selected ? (
              <div className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-4">
                <p className="text-sm font-semibold text-[color:var(--color-text)]">
                  {selected.name}
                </p>
                <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                  {selected.categoryName ?? selected.categoryId}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[color:var(--color-text-subtle)]">Current stock</span>
                  <Badge
                    label={String(selected.stock)}
                    variant={
                      selected.stock === 0
                        ? "danger"
                        : selected.stock < 5
                          ? "warning"
                          : "success"
                    }
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-4 text-xs text-[color:var(--color-text-muted)]">
                Pick a product to see current stock.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stock table */}
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="border-b border-[color:var(--color-surface-border)] p-5">
          <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
            Stock levels
          </h2>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Low stock (under 5) is highlighted.
          </p>
        </div>
        {loadingList ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">
            No products yet.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-surface-border)]">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[color:var(--color-text)]">
                    {p.name}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-subtle)]">
                    {p.categoryName ?? p.categoryId}
                  </p>
                </div>
                <Badge
                  label={`${p.stock} in stock`}
                  variant={
                    p.stock === 0 ? "danger" : p.stock < 5 ? "warning" : "success"
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
