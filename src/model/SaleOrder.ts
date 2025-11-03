// src/model/SaleOrder.ts

// ==========================
// ENUMS (theo BE constants)
// ==========================
export type OrderStatus = "CREATED" | "COMPLETED" | "CANCELED";
export type PaymentStatus = "FULL" | "INSTALLMENT";

// ==========================
// ENTITY (phản ánh theo SaleOrderResponse BE)
// ==========================
export interface SaleOrderItemResponse {
  id: string;
  vehicleId: string;
  vehicleName?: string; // fallback nếu BE có map tên xe
  vehicleUnitIds: string[];
  promotionId?: string | null;
  vehicleStatus: string;
  color: string;
  quantity: number;
  unitPrice: number;
  discountPrice: number;
  totalPrice: number;
}

// ==========================
// SALE ORDER RESPONSE
// ==========================
export interface SaleOrderResponse {
  id: string;
  createdAt: string;
  totalQuantity: number;
  totalPrice: number;
  vatAmount?: number;
  status: "CREATED" | "COMPLETED" | "CANCELED";

  accountId?: string;
  customerId?: string;
  dealerId?: string;
  saleContractId?: string;

  items?: {
    id: string;
    vehicleName: string;
    color: string;
    quantity: number;
    unitPrice: number;
    discountPrice?: number;
    totalPrice: number;
    promotionName?: string;
  }[];
}

// ==========================
// PAGE RESPONSE
// ==========================
export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SaleOrderPage {
  data: SaleOrderResponse[];
  metadata: PageMeta;
}
