import { fail, ok } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { deleteUserAccount } from "@/services/user.service";

function mapBusinessError(message: string) {
  switch (message) {
    case "CANNOT_DELETE_SELF":
      return fail("CANNOT_DELETE_SELF", "You cannot delete your own account", 400);
    case "LAST_ADMIN":
      return fail("LAST_ADMIN", "Cannot delete the last remaining admin", 400);
    case "USER_NOT_FOUND":
      return fail("USER_NOT_FOUND", "User not found", 404);
    default:
      return null;
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const actor = await requireAdminUser();
    const { userId } = await context.params;

    await deleteUserAccount(userId, actor.id);
    return ok({ deleted: userId });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return fail("UNAUTHORIZED", "You need to sign in", 401);
      }
      if (error.message === "FORBIDDEN") {
        return fail("FORBIDDEN", "Admin access required", 403);
      }
      const mapped = mapBusinessError(error.message);
      if (mapped) return mapped;
    }
    return fail("USER_DELETE_FAILED", "Unable to delete user", 500);
  }
}
