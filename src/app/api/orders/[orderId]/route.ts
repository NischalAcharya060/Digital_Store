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

    return ok(details);
  } catch (error) {
    if (error instanceof OrderServiceError && error.code === "FORBIDDEN") {
      return fail("FORBIDDEN", error.message, 403);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    return fail("ORDER_FETCH_FAILED", "Unable to fetch order", 500);
  }
}
