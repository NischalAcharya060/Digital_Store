import { fail, ok, parseJson } from "@/lib/utils/api";
import { requireStaffUser } from "@/lib/auth/server";
import { adminProductSchema } from "@/lib/validation/schemas";
import { upsertProduct } from "@/services/admin.service";
import { listAllProducts } from "@/services/catalog.service";

export async function GET() {
  try {
    await requireStaffUser();
    const products = await listAllProducts();
    return ok({ products });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Staff access required", 403);
    }

    return fail("ADMIN_PRODUCTS_FAILED", "Unable to fetch products", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaffUser();

    const payload = await parseJson(request);
    const parsed = adminProductSchema.safeParse(payload);

    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "Invalid product payload", 422);
    }

    const product = await upsertProduct(parsed.data);
    return ok({ product });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("UNAUTHORIZED", "You need to sign in", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return fail("FORBIDDEN", "Staff access required", 403);
    }

    return fail("ADMIN_PRODUCTS_SAVE_FAILED", "Unable to save product", 500);
  }
}
