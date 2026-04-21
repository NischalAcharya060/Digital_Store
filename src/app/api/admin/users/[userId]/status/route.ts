import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { adminUserStatusSchema } from "@/lib/validation/schemas";
import { setUserStatus } from "@/services/user.service";

function mapBusinessError(message: string) {
  switch (message) {
    case "CANNOT_SUSPEND_SELF":
      return fail("CANNOT_SUSPEND_SELF", "You cannot suspend your own account", 400);
    case "ADMIN_ROLE_RESTRICTED":
      return fail(
        "ADMIN_ROLE_RESTRICTED",
        "Only super admins can manage admin accounts",
        403,
      );
    case "SUPER_ADMIN_ROLE_LOCKED":
      return fail(
        "SUPER_ADMIN_ROLE_LOCKED",
        "Super admin account status cannot be changed here",
        403,
      );
    case "LAST_ADMIN":
      return fail("LAST_ADMIN", "Cannot suspend the last remaining admin", 400);
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
    const parsed = adminUserStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid status payload", 422);
    }

    const user = await setUserStatus(
      userId,
      parsed.data.status,
      {
        id: actor.id,
        role: actor.role,
      },
      parsed.data.reason,
    );
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
    return fail("USER_STATUS_UPDATE_FAILED", "Unable to update status", 500);
  }
}
