import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAuthUser } from "@/lib/auth/server";
import { verifyKhaltiSchema } from "@/lib/validation/schemas";
import {
  finalizePaidOrder,
  getOrderDetails,
  markOrderFailed,
  OrderServiceError,
} from "@/services/order.service";
import { verifyKhaltiPayment } from "@/services/payment.service";

export async function POST(request: Request) {
  try {
    const authUser = await requireAuthUser();
    const payload = await parseJson<{ orderId: string; pidx: string }>(request);

    const parsed = verifyKhaltiSchema.safeParse(payload);
    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid verification payload", 422);
    }

    const orderDetails = await getOrderDetails(parsed.data.orderId, authUser.uid);
    if (!orderDetails) {
      return fail("ORDER_NOT_FOUND", "Order not found", 404);
    }

    const result = await verifyKhaltiPayment({ pidx: parsed.data.pidx });

    if (!result.success) {
      await markOrderFailed(parsed.data.orderId, "khalti", result.providerTransactionId);
      return fail("PAYMENT_FAILED", "Khalti payment could not be verified", 402);
    }

    const delivery = await finalizePaidOrder(
      parsed.data.orderId,
      "khalti",
      result.providerTransactionId,
    );

    return ok({
      message: "Payment verified and delivery completed",
      deliveredCodes: delivery.deliveredCodes,
      providerResponse: result.raw,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      const status =
        error.code === "OUT_OF_STOCK"
          ? 409
          : error.code === "FORBIDDEN"
            ? 403
            : 400;
      return fail(error.code, error.message, status);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    return fail("PAYMENT_VERIFY_FAILED", "Unable to verify Khalti payment", 500);
  }
}
