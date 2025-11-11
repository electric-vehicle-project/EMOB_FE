// ENUMS (theo BE constants)
export type OrderStatus = "CREATED" | "COMPLETED" | "CANCELED";
export type PaymentStatus = "FULL" | "INSTALLMENT";

// ENTITY - ITEM RESPONSE
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

// SALE ORDER RESPONSE
export interface SaleOrderResponse {
  id: string;
  createdAt: string;
  totalQuantity: number;
  totalPrice: number;
  vatAmount?: number;
  status: OrderStatus;

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

// PAGE RESPONSE (theo BE PageResponse)
export interface PageResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// API RESPONSE WRAPPER (theo BE APIResponse)
export interface APIResponse<T> {
  code: number;
  message: string;
  result: T;
  timestamp?: string;
}

// FILTER PARAMS
export interface SaleOrderFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  statuses?: OrderStatus[];
  sortField?: string;
  sortDir?: "asc" | "desc";
  dealerId?: string;
  customerId?: string;
}

// SUMMARY RESPONSE (Sale-of-staff endpoint)
export interface SalesByStaffResponse {
  accountId: string;
  orderCount: number;
  amount: number;
}
