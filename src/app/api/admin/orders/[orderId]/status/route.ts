import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { adminOrderStatusSchema } from "@/lib/validation/schemas";
import { updateOrderStatus } from "@/services/admin.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdminUser();

    const { orderId } = await context.params;
    const payload = await parseJson(request);
    const parsed = adminOrderStatusSchema.safeParse(payload);

    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid order status payload", 422);
    }

    await updateOrderStatus(orderId, parsed.data.status);

    return ok({
      message: "Order status updated",
      orderId,
      status: parsed.data.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Admin access required", 403);
    }

    return fail("ORDER_STATUS_UPDATE_FAILED", "Unable to update status", 500);
  }
}
