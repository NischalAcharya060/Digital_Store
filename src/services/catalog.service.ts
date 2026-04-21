import "server-only";

import { COLLECTIONS } from "@/lib/constants/app";
import { firebaseAdminDb } from "@/lib/firebase/admin";
import type { Category, ProductWithStock } from "@/types/domain";

async function getStockMap(productIds: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(productIds)];
  const stockMap = new Map<string, number>();

  await Promise.all(
    unique.map(async (productId) => {
      const stockSnap = await firebaseAdminDb
        .collection(COLLECTIONS.inventory)
        .where("productId", "==", productId)
        .where("isUsed", "==", false)
        .get();

      stockMap.set(productId, stockSnap.size);
    }),
  );

  return stockMap;
}

export async function listActiveProducts(): Promise<ProductWithStock[]> {
  const [productsSnap, categoriesSnap] = await Promise.all([
    firebaseAdminDb
      .collection(COLLECTIONS.products)
      .where("active", "==", true)
      .get(),
    firebaseAdminDb.collection(COLLECTIONS.categories).get(),
  ]);

  const categories = new Map<string, Category>();

  categoriesSnap.forEach((doc) => {
    categories.set(doc.id, { id: doc.id, ...(doc.data() as Omit<Category, "id">) });
  });

  const rawProducts = productsSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ProductWithStock, "id" | "stock">),
  }));

  const stockMap = await getStockMap(rawProducts.map((product) => product.id));

  return rawProducts.map((product) => ({
    ...product,
    stock: stockMap.get(product.id) ?? 0,
    categoryName: categories.get(product.categoryId)?.name,
  }));
}

export async function listAllProducts(): Promise<ProductWithStock[]> {
  const [productsSnap, categoriesSnap] = await Promise.all([
    firebaseAdminDb.collection(COLLECTIONS.products).get(),
    firebaseAdminDb.collection(COLLECTIONS.categories).get(),
  ]);

  const categories = new Map<string, Category>();

  categoriesSnap.forEach((doc) => {
    categories.set(doc.id, { id: doc.id, ...(doc.data() as Omit<Category, "id">) });
  });

  const rawProducts = productsSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ProductWithStock, "id" | "stock">),
  }));

  const stockMap = await getStockMap(rawProducts.map((product) => product.id));

  return rawProducts.map((product) => ({
    ...product,
    stock: stockMap.get(product.id) ?? 0,
    categoryName: categories.get(product.categoryId)?.name,
  }));
}

export async function getProductById(productId: string): Promise<ProductWithStock | null> {
  const productSnap = await firebaseAdminDb
    .collection(COLLECTIONS.products)
    .doc(productId)
    .get();

  if (!productSnap.exists) {
    return null;
  }

  const [categorySnap, stockSnap] = await Promise.all([
    firebaseAdminDb
      .collection(COLLECTIONS.categories)
      .doc(productSnap.data()?.categoryId as string)
      .get(),
    firebaseAdminDb
      .collection(COLLECTIONS.inventory)
      .where("productId", "==", productId)
      .where("isUsed", "==", false)
      .get(),
  ]);

  const product = {
    id: productSnap.id,
    ...(productSnap.data() as Omit<ProductWithStock, "id" | "stock">),
  };

  return {
    ...product,
    stock: stockSnap.size,
    categoryName: categorySnap.exists ? (categorySnap.data()?.name as string) : undefined,
  };
}

export async function listCategories(): Promise<Category[]> {
  const categoriesSnap = await firebaseAdminDb.collection(COLLECTIONS.categories).get();

  return categoriesSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Category, "id">),
  }));
}
