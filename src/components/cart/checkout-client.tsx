"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PaymentMethod = "esewa" | "khalti";

interface CheckoutOrderResponse {
  order: {
    id: string;
    totalAmount: number;
  };
  verifyEndpoint: string;
}

export function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrderResponse | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [pidx, setPidx] = useState("");

  if (!user) {
    return (
      <div className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 text-center shadow-sm">
        <p className="text-sm text-[color:var(--color-text-muted)]">
          You need to login before checkout.
        </p>
        <Button className="mt-3" onClick={() => router.push("/login")}>
          Go to login
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 text-center shadow-sm">
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Your cart is empty. Add products before checkout.
        </p>
        <Button className="mt-3" onClick={() => router.push("/products")}>
          Browse products
        </Button>
      </div>
    );
  }

  async function createOrder() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const body = (await response.json()) as
        | { ok: true; data: CheckoutOrderResponse }
        | { ok: false; error: { message: string } };

      if (!response.ok || !body.ok) {
        throw new Error(!body.ok ? body.error.message : "Could not create order");
      }

      setCreatedOrder(body.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment() {
    if (!createdOrder) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload =
        paymentMethod === "esewa"
          ? {
              orderId: createdOrder.order.id,
              transactionId,
              totalAmount: createdOrder.order.totalAmount,
            }
          : {
              orderId: createdOrder.order.id,
              pidx,
            };

      const response = await fetch(createdOrder.verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as
        | { ok: true; data: { message: string } }
        | { ok: false; error: { message: string } };

      if (!response.ok || !body.ok) {
        throw new Error(!body.ok ? body.error.message : "Payment verification failed");
      }

      clear();
      router.push(`/orders/${createdOrder.order.id}`);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-6 rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Checkout</h1>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            Complete payment and receive delivery codes instantly.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[color:var(--color-text)]">Payment method</p>
          <div className="mt-2 flex gap-3">
            <Button
              variant={paymentMethod === "esewa" ? "primary" : "secondary"}
              onClick={() => setPaymentMethod("esewa")}
            >
              eSewa
            </Button>
            <Button
              variant={paymentMethod === "khalti" ? "primary" : "secondary"}
              onClick={() => setPaymentMethod("khalti")}
            >
              Khalti
            </Button>
          </div>
        </div>

        {!createdOrder ? (
          <Button disabled={loading} onClick={createOrder}>
            {loading ? "Creating order..." : "Create order"}
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-dashed border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-4">
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Order <span className="font-medium">{createdOrder.order.id}</span> created.
            </p>

            {paymentMethod === "esewa" ? (
              <Input
                label="eSewa transaction UUID"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="Enter transaction UUID after payment"
              />
            ) : (
              <Input
                label="Khalti PIDX"
                value={pidx}
                onChange={(event) => setPidx(event.target.value)}
                placeholder="Enter Khalti pidx after payment"
              />
            )}

            <Button
              disabled={
                loading ||
                (paymentMethod === "esewa" ? transactionId.length < 3 : pidx.length < 3)
              }
              onClick={verifyPayment}
            >
              {loading ? "Verifying..." : "Verify payment and deliver"}
            </Button>
          </div>
        )}

        {error ? (
          <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {error}
          </p>
        ) : null}
      </section>

      <aside className="h-fit rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Summary</h2>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-text-muted)]">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>NPR {(item.quantity * item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-[color:var(--color-surface-border)] pt-4 text-lg font-semibold text-[color:var(--color-text)]">
          Total: NPR {total.toFixed(2)}
        </p>
      </aside>
    </div>
  );
}
