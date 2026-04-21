import type { OrderStatus, PaymentMethod } from "@/types/domain";

export const APP_NAME = "Digital Store";

export const SESSION_COOKIE_NAME = "digital_store_session";

export const COLLECTIONS = {
  users: "users",
  products: "products",
  categories: "categories",
  orders: "orders",
  orderItems: "orderItems",
  inventory: "inventory",
  transactions: "transactions",
} as const;

export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "failed"];

export const PAYMENT_METHODS: PaymentMethod[] = ["esewa", "khalti"];
