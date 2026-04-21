import { fail, ok } from "@/lib/utils/api";
import { requireStaffUser } from "@/lib/auth/server";
import { listAllOrders } from "@/services/order.service";

export async function GET() {
  try {
    await requireStaffUser();
    const orders = await listAllOrders();
    return ok({ orders });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Staff access required", 403);
    }

    return fail("ADMIN_ORDERS_FAILED", "Unable to fetch admin orders", 500);
  }
}
