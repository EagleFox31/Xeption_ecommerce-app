export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  transactionId?: string;
  status: PaymentStatus;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  MOBILE_MONEY = "mobile_money",
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export enum PaymentProvider {
  CINETPAY = "cinetpay",
  STRIPE = "stripe",
  PAYPAL = "paypal",
  MTN_MONEY = "mtn_money",
  ORANGE_MONEY = "orange_money",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export interface CreatePaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentRequest {
  paymentId: string;
  transactionId: string;
  status: PaymentStatus;
  failureReason?: string;
}
