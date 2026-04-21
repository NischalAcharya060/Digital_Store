"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Category, ProductWithStock } from "@/types/domain";

type ProductRow = ProductWithStock;

interface FormState {
  id?: string;
  name: string;
  categoryId: string;
  price: string;
  description: string;
  image: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  categoryId: "",
  price: "",
  description: "",
  image: "",
  active: true,
};

export function AdminProductsClient() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, catsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const productsBody = await productsRes.json();
      const catsBody = await catsRes.json();

      if (!productsRes.ok || !productsBody.ok) {
        throw new Error(productsBody?.error?.message ?? "Failed to load products");
      }
      if (!catsRes.ok || !catsBody.ok) {
        throw new Error(catsBody?.error?.message ?? "Failed to load categories");
      }

      setProducts(productsBody.data.products);
      setCategories(catsBody.data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
  }

  function editRow(row: ProductRow) {
    setForm({
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      price: row.price.toString(),
      description: row.description,
      image: row.image,
      active: row.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryId || !form.image || !form.description) {
      setError("Fill all fields");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form.id ? { id: form.id } : {}),
          name: form.name.trim(),
          categoryId: form.categoryId,
          price: Number(form.price),
          description: form.description.trim(),
          image: form.image.trim(),
          active: form.active,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to save");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to delete");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryName ?? "").toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div className="space-y-6">
      {/* FORM */}
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
              {form.id ? "Edit product" : "Add product"}
            </h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {form.id
                ? `Editing #${form.id}. Save to publish changes.`
                : "New products appear in the catalog instantly."}
            </p>
          </div>
          {form.id ? (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Name"
                placeholder="Apple Gift Card $50"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <label className="flex flex-col gap-1.5 text-sm text-[color:var(--color-text-muted)]">
                <span className="font-medium text-[color:var(--color-text)]">
                  Category
                </span>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, categoryId: e.target.value }))
                  }
                  className="h-11 rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 text-sm text-[color:var(--color-text)] transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 ? (
                  <span className="text-[11px] text-[color:var(--color-warning)]">
                    No categories yet — create one first.
                  </span>
                ) : null}
              </label>
              <Input
                label="Price (NPR)"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              />
              <Input
                label="Image URL"
                placeholder="https://..."
                value={form.image}
                onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              />
            </div>

            <label className="flex flex-col gap-1.5 text-sm text-[color:var(--color-text-muted)]">
              <span className="font-medium text-[color:var(--color-text)]">
                Description
              </span>
              <textarea
                rows={3}
                placeholder="What does the buyer get?"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="resize-y rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-[color:var(--color-surface-border)] accent-[color:var(--color-accent)]"
              />
              <span>Active (visible in storefront)</span>
            </label>

            {error ? (
              <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--color-danger)]">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : form.id ? "Save changes" : "Publish product"}
              </Button>
              {form.id ? null : (
                <Button variant="ghost" onClick={resetForm} disabled={saving}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-subtle)]">
              Preview
            </p>
            <div className="overflow-hidden rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)]">
              <div className="relative aspect-[4/3] w-full bg-[color:var(--color-canvas-2)]">
                {form.image ? (
                  <Image
                    src={form.image}
                    alt=""
                    fill
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[color:var(--color-text-subtle)]">
                    Image preview
                  </div>
                )}
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-1 text-sm font-semibold text-[color:var(--color-text)]">
                  {form.name || "Untitled product"}
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  NPR {form.price || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="flex flex-col gap-3 border-b border-[color:var(--color-surface-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
              Catalog
            </h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {products.length} products total
            </p>
          </div>
          <Input
            placeholder="Search name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 sm:max-w-xs"
          />
        </div>

        {loading ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-[color:var(--color-text-muted)]">
            No products match.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-surface-border)]">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-[color:var(--color-surface-2)]">
                  {row.image ? (
                    <Image
                      src={row.image}
                      alt=""
                      fill
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[color:var(--color-text)]">
                      {row.name}
                    </p>
                    <Badge
                      label={row.active ? "Active" : "Hidden"}
                      variant={row.active ? "success" : "neutral"}
                    />
                  </div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    {row.categoryName ?? row.categoryId}
                  </p>
                  <p className="mt-0.5 text-xs text-[color:var(--color-text-subtle)]">
                    Stock: <span className={cn("font-semibold", row.stock === 0 ? "text-[color:var(--color-danger)]" : row.stock < 5 ? "text-[color:var(--color-warning)]" : "text-[color:var(--color-success)]")}>{row.stock}</span> · NPR {row.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => editRow(row)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => void handleDelete(row.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
