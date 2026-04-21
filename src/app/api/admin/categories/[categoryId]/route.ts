import { fail, ok } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { deleteCategory } from "@/services/admin.service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  try {
    await requireAdminUser();
    const { categoryId } = await context.params;
    await deleteCategory(categoryId);
    return ok({ deleted: categoryId });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Admin access required", 403);
    }
    return fail("ADMIN_CATEGORY_DELETE_FAILED", "Unable to delete category", 500);
  }
}
