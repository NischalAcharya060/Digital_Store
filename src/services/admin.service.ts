import "server-only";

import { COLLECTIONS } from "@/lib/constants/app";
import { firebaseAdminDb } from "@/lib/firebase/admin";
import { nowIso } from "@/lib/utils/time";
import type { Category, OrderStatus, Product } from "@/types/domain";

export async function upsertCategory(input: Omit<Category, "id"> & { id?: string }) {
  const ref = input.id
    ? firebaseAdminDb.collection(COLLECTIONS.categories).doc(input.id)
    : firebaseAdminDb.collection(COLLECTIONS.categories).doc();

  const payload: Omit<Category, "id"> = { name: input.name };
  await ref.set(payload, { merge: true });
  return { id: ref.id, ...payload };
}

export async function deleteCategory(categoryId: string) {
  await firebaseAdminDb.collection(COLLECTIONS.categories).doc(categoryId).delete();
}

export async function deleteProduct(productId: string) {
  await firebaseAdminDb.collection(COLLECTIONS.products).doc(productId).delete();
}

export async function upsertProduct(input: Omit<Product, "id"> & { id?: string }) {
  const ref = input.id
    ? firebaseAdminDb.collection(COLLECTIONS.products).doc(input.id)
    : firebaseAdminDb.collection(COLLECTIONS.products).doc();

  const payload: Omit<Product, "id"> = {
    name: input.name,
    categoryId: input.categoryId,
    price: input.price,
    description: input.description,
    image: input.image,
    active: input.active,
  };

  await ref.set(payload, { merge: true });

  return { id: ref.id, ...payload };
}

export async function uploadInventoryCodes(input: {
  productId: string;
  codes: string[];
}) {
  const cleanedCodes = [...new Set(input.codes.map((code) => code.trim()))].filter(Boolean);

  if (cleanedCodes.length === 0) {
    return { createdCount: 0 };
  }

  const existingCodesSnap = await firebaseAdminDb
    .collection(COLLECTIONS.inventory)
    .where("productId", "==", input.productId)
    .get();

  const existingCodes = new Set(
    existingCodesSnap.docs.map((doc) => (doc.data()?.code as string)?.trim()),
  );

  const newCodes = cleanedCodes.filter((code) => !existingCodes.has(code));

  if (newCodes.length === 0) {
    return { createdCount: 0 };
  }

  const batch = firebaseAdminDb.batch();
  for (const code of newCodes) {
    const ref = firebaseAdminDb.collection(COLLECTIONS.inventory).doc();
    batch.set(ref, {
      productId: input.productId,
      code,
      isUsed: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  await batch.commit();

  return { createdCount: newCodes.length };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const ref = firebaseAdminDb.collection(COLLECTIONS.orders).doc(orderId);
  await ref.update({
    status,
    updatedAt: nowIso(),
  });
}
