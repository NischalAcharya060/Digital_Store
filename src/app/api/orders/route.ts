import { fail, ok } from "@/lib/utils/api";
import { requireAuthUser } from "@/lib/auth/server";
import { getOrdersByUserId } from "@/services/order.service";

export async function GET() {
  try {
    const authUser = await requireAuthUser();
    const orders = await getOrdersByUserId(authUser.uid);
    return ok({ orders });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    return fail("ORDER_FETCH_FAILED", "Unable to fetch orders", 500);
  }
}
