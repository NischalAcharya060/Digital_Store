import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireAdminUser } from "@/lib/auth/server";
import { adminCategorySchema } from "@/lib/validation/schemas";
import { upsertCategory } from "@/services/admin.service";
import { listCategories } from "@/services/catalog.service";

export async function GET() {
  try {
    await requireAdminUser();
    const categories = await listCategories();
    return ok({ categories });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Admin access required", 403);
    }
    return fail("ADMIN_CATEGORIES_FAILED", "Unable to fetch categories", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const payload = await parseJson(request);
    const parsed = adminCategorySchema.safeParse(payload);

    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid category payload", 422);
    }

    const category = await upsertCategory(parsed.data);
    return ok({ category });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Admin access required", 403);
    }
    return fail("ADMIN_CATEGORIES_SAVE_FAILED", "Unable to save category", 500);
  }
}
