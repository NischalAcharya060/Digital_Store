export type UserRole = "user" | "moderator" | "admin" | "super_admin";

export type UserStatus = "active" | "suspended";

export type OrderStatus = "pending" | "paid" | "failed";

export type PaymentMethod = "esewa" | "khalti";

export type PaymentStatus = "pending" | "success" | "failed";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  suspendedAt?: string;
  suspendedReason?: string;
  suspendedBy?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  active: boolean;
}

export interface InventoryCode {
  id: string;
  productId: string;
  code: string;
  isUsed: boolean;
  usedByOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  deliveredCodes?: string[];
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ProductWithStock extends Product {
  stock: number;
  categoryName?: string;
}
