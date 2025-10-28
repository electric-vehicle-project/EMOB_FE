// src/model/SaleOrder.ts
export const SaleOrderStatus = {
  CREATED: "CREATED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;
export type SaleOrderStatus =
  (typeof SaleOrderStatus)[keyof typeof SaleOrderStatus];

export const PaymentStatus = {
  FULL: "FULL",
  INSTALLMENT: "INSTALLMENT",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const VehicleStatus = {
  NORMAL: "NORMAL",
  SPECIAL: "SPECIAL",
} as const;
export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

// ================== Interface ==================

export interface ISaleOrderItem {
  id: string;
  vehicleId: string;
  promotionId?: string | null;
  vehicleStatus: VehicleStatus;
  color: string;
  quantity: number;
  unitPrice: number;
  discountPrice: number;
  totalPrice: number;
}

export interface ISaleOrder {
  id: string;
  customerId: string;
  dealerId: string;
  accountId: string;
  items: ISaleOrderItem[];
  totalPrice: number;
  totalQuantity: number;
  validUntil: number;
  status: SaleOrderStatus;
  createdAt: string;
  paymentStatus?: PaymentStatus; // nếu BE trả về
}

// ================== Payload (dành cho Complete) ==================

export interface ICompleteOrderFull {
  orderId: string;
}

export interface ICompleteOrderInstallment {
  orderId: string;
  deposit: number;
  downPayment: string; // ISO format
  totalAmount: number;
  termMonths: number;
  interestRate: number;
}
