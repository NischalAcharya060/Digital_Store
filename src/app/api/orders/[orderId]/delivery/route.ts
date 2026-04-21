import { fail, ok } from "@/lib/utils/api";
import { requireAuthUser } from "@/lib/auth/server";
import { getOrderDetails, OrderServiceError } from "@/services/order.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const authUser = await requireAuthUser();
    const { orderId } = await context.params;

    const details = await getOrderDetails(orderId, authUser.uid);

    if (!details) {
      return fail("ORDER_NOT_FOUND", "Order not found", 404);
    }

    if (details.order.status !== "paid") {
      return fail("DELIVERY_UNAVAILABLE", "Delivery available only after payment", 409);
    }

    const delivery = details.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      deliveredCodes: item.deliveredCodes ?? [],
    }));

    return ok({ orderId, delivery });
  } catch (error) {
    if (error instanceof OrderServiceError && error.code === "FORBIDDEN") {
      return fail("FORBIDDEN", error.message, 403);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    return fail("DELIVERY_FETCH_FAILED", "Unable to fetch delivery", 500);
  }
}
