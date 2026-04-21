import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAuthUser } from "@/lib/auth/server";
import { verifyEsewaSchema } from "@/lib/validation/schemas";
import {
  finalizePaidOrder,
  getOrderDetails,
  markOrderFailed,
  OrderServiceError,
} from "@/services/order.service";
import { verifyEsewaPayment } from "@/services/payment.service";

export async function POST(request: Request) {
  try {
    const authUser = await requireAuthUser();
    const payload = await parseJson<{
      orderId: string;
      transactionId: string;
      totalAmount: number;
    }>(request);

    const parsed = verifyEsewaSchema.safeParse(payload);
    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid verification payload", 422);
    }

    const orderDetails = await getOrderDetails(parsed.data.orderId, authUser.uid);
    if (!orderDetails) {
      return fail("ORDER_NOT_FOUND", "Order not found", 404);
    }

    if (orderDetails.order.totalAmount !== parsed.data.totalAmount) {
      return fail("AMOUNT_MISMATCH", "Payment amount mismatch", 409);
    }

    const result = await verifyEsewaPayment({
      transactionId: parsed.data.transactionId,
      totalAmount: parsed.data.totalAmount,
    });

    if (!result.success) {
      await markOrderFailed(parsed.data.orderId, "esewa", result.providerTransactionId);
      return fail("PAYMENT_FAILED", "eSewa payment could not be verified", 402);
    }

    const delivery = await finalizePaidOrder(
      parsed.data.orderId,
      "esewa",
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

    return fail("PAYMENT_VERIFY_FAILED", "Unable to verify eSewa payment", 500);
  }
}
