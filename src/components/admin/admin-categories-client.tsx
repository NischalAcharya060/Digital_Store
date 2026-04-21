"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/domain";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; categories: Category[] };

export function AdminCategoriesClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    try {
      const response = await fetch("/api/admin/categories");
      const body = (await response.json()) as
        | { ok: true; data: { categories: Category[] } }
        | { ok: false; error: { message: string } };

      if (!response.ok || !body.ok) {
        throw new Error(!body.ok ? body.error.message : "Failed to load categories");
      }

      setState({ status: "ready", categories: body.data.categories });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load categories",
      });
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to save");
      }
      setName("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Products already using it will keep the ID.")) return;
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to delete");
      }
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
        <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
          Add category
        </h2>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
          Categories appear in the storefront chip rail and filter sidebar.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Category name"
            placeholder="e.g. Game Top-ups"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:max-w-sm"
          />
          <Button onClick={create} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Create"}
          </Button>
        </div>
        {actionError ? (
          <p className="mt-3 text-xs text-[color:var(--color-danger)]">{actionError}</p>
        ) : null}
      </section>

      <section className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]">
        <div className="border-b border-[color:var(--color-surface-border)] p-5">
          <h2 className="text-sm font-semibold text-[color:var(--color-text)]">
            All categories
          </h2>
        </div>

        {state.status === "loading" ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">Loading...</p>
        ) : state.status === "error" ? (
          <p className="p-5 text-sm text-[color:var(--color-danger)]">{state.message}</p>
        ) : state.status === "ready" && state.categories.length === 0 ? (
          <p className="p-5 text-sm text-[color:var(--color-text-muted)]">
            No categories yet. Add your first above.
          </p>
        ) : state.status === "ready" ? (
          <ul className="divide-y divide-[color:var(--color-surface-border)]">
            {state.categories.map((cat: Category) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[color:var(--color-text)]">{cat.name}</p>
                  <p className="truncate font-mono text-[11px] text-[color:var(--color-text-subtle)]">
                    {cat.id}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void remove(cat.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
