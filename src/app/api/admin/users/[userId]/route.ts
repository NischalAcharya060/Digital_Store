import { fail } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";

export async function DELETE(
  _request: Request,
) {
  try {
    await requireAdminUser();
    return fail(
      "USER_DELETE_DISABLED",
      "User deletion is disabled. Use ban/suspend instead.",
      405,
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return fail("UNAUTHORIZED", "You need to sign in", 401);
      }
      if (error.message === "FORBIDDEN") {
        return fail("FORBIDDEN", "Admin access required", 403);
      }
    }
    return fail("USER_DELETE_DISABLED", "User deletion is disabled", 405);
  }
}
