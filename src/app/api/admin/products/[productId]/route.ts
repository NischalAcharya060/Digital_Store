import { fail, ok } from "@/lib/utils/api";
import { requireStaffUser } from "@/lib/auth/server";
import { deleteProduct } from "@/services/admin.service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    await requireStaffUser();
    const { productId } = await context.params;
    await deleteProduct(productId);
    return ok({ deleted: productId });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Staff access required", 403);
    }
    return fail("ADMIN_PRODUCT_DELETE_FAILED", "Unable to delete product", 500);
  }
}
