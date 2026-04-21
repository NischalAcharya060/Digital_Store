import { fail, ok } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { listAllUsers } from "@/services/user.service";

export async function GET() {
  try {
    const actor = await requireAdminUser();
    const users = await listAllUsers();
    return ok({ users, actorId: actor.id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Admin access required", 403);
    }
    return fail("ADMIN_USERS_FAILED", "Unable to fetch users", 500);
  }
}
