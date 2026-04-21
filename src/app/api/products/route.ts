import { fail, ok } from "@/lib/utils/api";
import { listActiveProducts } from "@/services/catalog.service";

export async function GET() {
  try {
    const products = await listActiveProducts();
    return ok({ products });
  } catch {
    return fail("PRODUCT_FETCH_FAILED", "Unable to fetch products", 500);
  }
}
