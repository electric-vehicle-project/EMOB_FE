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

  // Tổng quan
  totalPrice: number;
  totalQuantity: number;
  vatAmount: number;
  createdAt: string;

  // Trạng thái
  status: OrderStatus;
  paymentStatus?: PaymentStatus;

  // Quan hệ
  accountId?: string; // nhân viên tạo đơn
  dealerId?: string;
  customerId?: string;
  saleContractId?: string;
  contractId?: string; // alias để FE dùng tiện hơn
  quotationId?: string;
  installmentPlanId?: string;

  // Metadata hiển thị
  customerName?: string;
  dealerName?: string;
  staffName?: string;

  // Danh sách sản phẩm
  items?: SaleOrderItemResponse[];
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
