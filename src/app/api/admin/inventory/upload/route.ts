import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { inventoryUploadSchema } from "@/lib/validation/schemas";
import { uploadInventoryCodes } from "@/services/admin.service";

export async function POST(request: Request) {
  try {
    await requireAdminUser();

    const payload = await parseJson(request);
    const parsed = inventoryUploadSchema.safeParse(payload);

    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid inventory payload", 422);
    }

    const result = await uploadInventoryCodes(parsed.data);

    return ok({
      message: "Inventory updated",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Admin access required", 403);
    }

    return fail("INVENTORY_UPLOAD_FAILED", "Unable to upload inventory", 500);
  }
}
