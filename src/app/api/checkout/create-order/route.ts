import { createOrderSchema } from "@/lib/validation/schemas";
import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAuthUser } from "@/lib/auth/server";
import { createPendingOrder, OrderServiceError } from "@/services/order.service";

export async function POST(request: Request) {
  try {
    const authUser = await requireAuthUser();
    const payload = await parseJson<{
      items: { productId: string; quantity: number }[];
      paymentMethod: "esewa" | "khalti";
    }>(request);

    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid checkout payload", 422);
    }

    const created = await createPendingOrder({
      userId: authUser.uid,
      items: parsed.data.items,
      paymentMethod: parsed.data.paymentMethod,
    });

    return ok({
      order: created.order,
      items: created.items,
      verifyEndpoint:
        parsed.data.paymentMethod === "esewa"
          ? "/api/payments/esewa/verify"
          : "/api/payments/khalti/verify",
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      const status = error.code === "OUT_OF_STOCK" ? 409 : 400;
      return fail(error.code, error.message, status);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    return fail("ORDER_CREATE_FAILED", "Unable to create order", 500);
  }
}
