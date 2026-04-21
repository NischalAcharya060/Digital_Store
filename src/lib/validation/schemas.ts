import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/constants/app";

export const sessionSchema = z.object({
  idToken: z.string().min(10),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export const verifyEsewaSchema = z.object({
  orderId: z.string().min(1),
  transactionId: z.string().min(1),
  totalAmount: z.number().positive(),
});

export const verifyKhaltiSchema = z.object({
  orderId: z.string().min(1),
  pidx: z.string().min(1),
});

export const adminProductSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2),
  categoryId: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(8),
  image: z.string().url(),
  active: z.boolean().default(true),
});

export const inventoryUploadSchema = z.object({
  productId: z.string().min(1),
  codes: z.array(z.string().min(3)).min(1),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "failed"]),
});

export const adminCategorySchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2).max(60),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["user", "moderator", "admin"]),
});

export const adminUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
  reason: z.string().max(200).optional(),
});
