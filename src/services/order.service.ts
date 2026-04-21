import "server-only";

import { COLLECTIONS } from "@/lib/constants/app";
import { firebaseAdminDb } from "@/lib/firebase/admin";
import { nowIso } from "@/lib/utils/time";
import type {
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  TransactionRecord,
} from "@/types/domain";

export class OrderServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export interface CreateOrderInput {
  userId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}

export async function createPendingOrder(input: CreateOrderInput): Promise<{
  order: Order;
  items: OrderItem[];
}> {
  const uniqueProductIds = [...new Set(input.items.map((item) => item.productId))];

  const productSnaps = await Promise.all(
    uniqueProductIds.map((id) =>
      firebaseAdminDb.collection(COLLECTIONS.products).doc(id).get(),
    ),
  );

  const productMap = new Map<string, Product>();

  for (const snap of productSnaps) {
    if (!snap.exists) {
      throw new OrderServiceError("PRODUCT_NOT_FOUND", "Product not found");
    }

    const product = { id: snap.id, ...(snap.data() as Omit<Product, "id">) };

    if (!product.active) {
      throw new OrderServiceError("PRODUCT_INACTIVE", `${product.name} is inactive`);
    }

    productMap.set(product.id, product);
  }

  await Promise.all(
    input.items.map(async (item) => {
      const stockSnap = await firebaseAdminDb
        .collection(COLLECTIONS.inventory)
        .where("productId", "==", item.productId)
        .where("isUsed", "==", false)
        .limit(item.quantity)
        .get();

      if (stockSnap.size < item.quantity) {
        const product = productMap.get(item.productId);
        throw new OrderServiceError(
          "OUT_OF_STOCK",
          `${product?.name ?? item.productId} is out of stock`,
        );
      }
    }),
  );

  const totalAmount = input.items.reduce((total, item) => {
    const product = productMap.get(item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const timestamp = nowIso();
  const orderRef = firebaseAdminDb.collection(COLLECTIONS.orders).doc();

  const order: Order = {
    id: orderRef.id,
    userId: input.userId,
    totalAmount,
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const orderItems: OrderItem[] = input.items.map((item) => ({
    id: firebaseAdminDb.collection(COLLECTIONS.orderItems).doc().id,
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
    price: productMap.get(item.productId)?.price ?? 0,
  }));

  const transactionRecord: TransactionRecord = {
    id: firebaseAdminDb.collection(COLLECTIONS.transactions).doc().id,
    orderId: order.id,
    paymentMethod: input.paymentMethod,
    status: "pending",
    transactionId: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const batch = firebaseAdminDb.batch();
  batch.set(orderRef, order);

  for (const item of orderItems) {
    const ref = firebaseAdminDb.collection(COLLECTIONS.orderItems).doc(item.id);
    batch.set(ref, item);
  }

  const transactionRef = firebaseAdminDb
    .collection(COLLECTIONS.transactions)
    .doc(transactionRecord.id);
  batch.set(transactionRef, transactionRecord);

  await batch.commit();

  return { order, items: orderItems };
}

export async function finalizePaidOrder(
  orderId: string,
  paymentMethod: PaymentMethod,
  providerTransactionId: string,
): Promise<{ deliveredCodes: Record<string, string[]> }> {
  const result = await firebaseAdminDb.runTransaction(async (tx) => {
    const orderRef = firebaseAdminDb.collection(COLLECTIONS.orders).doc(orderId);
    const orderSnap = await tx.get(orderRef);

    if (!orderSnap.exists) {
      throw new OrderServiceError("ORDER_NOT_FOUND", "Order not found");
    }

    const order = orderSnap.data() as Order;

    if (order.status === "paid") {
      const itemsSnap = await tx.get(
        firebaseAdminDb
          .collection(COLLECTIONS.orderItems)
          .where("orderId", "==", orderId),
      );

      const deliveredCodes: Record<string, string[]> = {};

      itemsSnap.docs.forEach((doc) => {
        const item = doc.data() as OrderItem;
        deliveredCodes[item.productId] = item.deliveredCodes ?? [];
      });

      return { deliveredCodes };
    }

    if (order.status !== "pending") {
      throw new OrderServiceError(
        "ORDER_NOT_PAYABLE",
        "Order is not in pending state",
      );
    }

    const itemsQuery = firebaseAdminDb
      .collection(COLLECTIONS.orderItems)
      .where("orderId", "==", orderId);
    const orderItemsSnap = await tx.get(itemsQuery);

    if (orderItemsSnap.empty) {
      throw new OrderServiceError("ORDER_ITEMS_EMPTY", "Order has no items");
    }

    const deliveredCodes: Record<string, string[]> = {};

    for (const itemDoc of orderItemsSnap.docs) {
      const item = itemDoc.data() as OrderItem;
      const inventoryQuery = firebaseAdminDb
        .collection(COLLECTIONS.inventory)
        .where("productId", "==", item.productId)
        .where("isUsed", "==", false)
        .limit(item.quantity);

      const inventorySnap = await tx.get(inventoryQuery);

      if (inventorySnap.size < item.quantity) {
        throw new OrderServiceError(
          "OUT_OF_STOCK",
          "Inventory became unavailable during payment verification",
        );
      }

      const selectedDocs = inventorySnap.docs.slice(0, item.quantity);
      const codes = selectedDocs.map((doc) => (doc.data()?.code as string) ?? "");
      deliveredCodes[item.productId] = codes;

      for (const doc of selectedDocs) {
        tx.update(doc.ref, {
          isUsed: true,
          usedByOrderId: orderId,
          updatedAt: nowIso(),
        });
      }

      tx.update(itemDoc.ref, {
        deliveredCodes: codes,
      });
    }

    const transactionSnap = await tx.get(
      firebaseAdminDb
        .collection(COLLECTIONS.transactions)
        .where("orderId", "==", orderId)
        .where("paymentMethod", "==", paymentMethod)
        .limit(1),
    );

    const transactionDoc = transactionSnap.docs[0];
    if (!transactionDoc) {
      throw new OrderServiceError("TRANSACTION_NOT_FOUND", "Transaction not found");
    }

    tx.update(orderRef, {
      status: "paid",
      updatedAt: nowIso(),
    });

    tx.update(transactionDoc.ref, {
      status: "success",
      transactionId: providerTransactionId,
      updatedAt: nowIso(),
    });

    return { deliveredCodes };
  });

  return result;
}

export async function markOrderFailed(
  orderId: string,
  paymentMethod: PaymentMethod,
  providerTransactionId: string,
): Promise<void> {
  const transactionSnap = await firebaseAdminDb
    .collection(COLLECTIONS.transactions)
    .where("orderId", "==", orderId)
    .where("paymentMethod", "==", paymentMethod)
    .limit(1)
    .get();

  const txDoc = transactionSnap.docs[0];

  const batch = firebaseAdminDb.batch();
  batch.update(firebaseAdminDb.collection(COLLECTIONS.orders).doc(orderId), {
    status: "failed",
    updatedAt: nowIso(),
  });

  if (txDoc) {
    batch.update(txDoc.ref, {
      status: "failed",
      transactionId: providerTransactionId,
      updatedAt: nowIso(),
    });
  }

  await batch.commit();
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const snap = await firebaseAdminDb
    .collection(COLLECTIONS.orders)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => doc.data() as Order);
}

export async function getOrderDetails(orderId: string, userId?: string) {
  const orderSnap = await firebaseAdminDb
    .collection(COLLECTIONS.orders)
    .doc(orderId)
    .get();

  if (!orderSnap.exists) {
    return null;
  }

  const order = orderSnap.data() as Order;

  if (userId && order.userId !== userId) {
    throw new OrderServiceError("FORBIDDEN", "You cannot access this order");
  }

  const [itemsSnap, transactionSnap] = await Promise.all([
    firebaseAdminDb
      .collection(COLLECTIONS.orderItems)
      .where("orderId", "==", orderId)
      .get(),
    firebaseAdminDb
      .collection(COLLECTIONS.transactions)
      .where("orderId", "==", orderId)
      .limit(1)
      .get(),
  ]);

  const items = itemsSnap.docs.map((doc) => doc.data() as OrderItem);
  const transaction = transactionSnap.docs[0]?.data() as TransactionRecord | undefined;

  return {
    order,
    items,
    transaction,
  };
}

export async function listAllOrders(): Promise<Order[]> {
  const snap = await firebaseAdminDb
    .collection(COLLECTIONS.orders)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => doc.data() as Order);
}
