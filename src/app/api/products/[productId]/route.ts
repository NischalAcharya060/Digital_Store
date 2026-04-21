import { fail, ok } from "@/lib/utils/api";
import { getProductById } from "@/services/catalog.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  const { productId } = await context.params;

  try {
    const product = await getProductById(productId);

    if (!product) {
      return fail("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    return ok({ product });
  } catch {
    return fail("PRODUCT_FETCH_FAILED", "Unable to fetch product", 500);
  }
}
