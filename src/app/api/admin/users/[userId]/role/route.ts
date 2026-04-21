import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { adminUserRoleSchema } from "@/lib/validation/schemas";
import { updateUserRole } from "@/services/user.service";

function mapBusinessError(message: string) {
  switch (message) {
    case "CANNOT_DEMOTE_SELF":
      return fail("CANNOT_DEMOTE_SELF", "You cannot change your own admin role", 400);
    case "LAST_ADMIN":
      return fail("LAST_ADMIN", "At least one admin must remain", 400);
    case "USER_NOT_FOUND":
      return fail("USER_NOT_FOUND", "User not found", 404);
    default:
      return null;
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const actor = await requireAdminUser();
    const { userId } = await context.params;

    const payload = await parseJson(request);
    const parsed = adminUserRoleSchema.safeParse(payload);
    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid role payload", 422);
    }

    const user = await updateUserRole(userId, parsed.data.role, actor.id);
    return ok({ user });
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
    return fail("USER_ROLE_UPDATE_FAILED", "Unable to update role", 500);
  }
}
