import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import type { OrderStatus } from "../model/SaleOrder";

const BASE_URL = "/sale-order";

/* ======================================================
   SALE ORDER SERVICE – HỖ TRỢ SORT, FILTER, PAGINATION
   ====================================================== */

//  GET /sale-order/current-dealer?page=&size=&keyword=&statuses=&sortField=&sortDir=
// (MANAGER, DEALER_STAFF xem đơn hàng của đại lý hiện tại)
export const useSaleOrderListCurrentDealer = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  statuses?: OrderStatus[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) =>
  createQueryHook("saleOrderListCurrentDealer", `${BASE_URL}/current-dealer`)(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      keyword: params?.keyword ?? "",
      statuses: params?.statuses,
      sortField: params?.sortField ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    }
  );

//  GET /sale-order/staff/current?page=&size=&keyword=&statuses=&sortField=&sortDir=
// (DEALER_STAFF xem đơn hàng do chính nhân viên đó tạo)
export const useSaleOrderListStaffCurrent = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  statuses?: OrderStatus[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) =>
  createQueryHook("saleOrderListStaffCurrent", `${BASE_URL}/staff/current`)(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      keyword: params?.keyword ?? "",
      statuses: params?.statuses,
      sortField: params?.sortField ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    }
  );

//  GET /sale-order/dealers?page=&size=&keyword=&statuses=&sortField=&sortDir=
// (EVM_STAFF, ADMIN xem tất cả đơn hàng của các đại lý)
export const useSaleOrderListDealers = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  statuses?: OrderStatus[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) =>
  createQueryHook("saleOrderListDealers", `${BASE_URL}/dealers`)(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      keyword: params?.keyword ?? "",
      statuses: params?.statuses,
      sortField: params?.sortField ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    }
  );

//  GET /sale-order/customers/{customerId}?page=&size=&keyword=&statuses=&sortField=&sortDir=
// (MANAGER, DEALER_STAFF xem đơn hàng của khách hàng cụ thể)
export const useSaleOrderListByCustomer = (
  customerId: string,
  params?: {
    page?: number;
    size?: number;
    keyword?: string;
    statuses?: OrderStatus[];
    sortField?: string;
    sortDir?: "asc" | "desc";
  }
) =>
  createQueryHook(
    "saleOrderListByCustomer",
    `${BASE_URL}/customers/${customerId}`
  )(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      keyword: params?.keyword ?? "",
      statuses: params?.statuses,
      sortField: params?.sortField ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    }
  );

//  GET /sale-order/sale-of-staff?page=&size=&sortField=&sortDir=
// (MANAGER xem thống kê doanh số theo nhân viên)
export const useSalesByStaff = (params?: {
  page?: number;
  size?: number;
  sortField?: string;
  sortDir?: "asc" | "desc";
}) =>
  createQueryHook("salesByStaff", `${BASE_URL}/sale-of-staff`)(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sortField: params?.sortField ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    }
  );

//  GET /sale-order/{id}
// (Lấy chi tiết đơn hàng)
export const useSaleOrderById = createQueryWithPathParamHook(
  "saleOrderDetail",
  BASE_URL
);

//  POST /sale-order/{id}/completed
// (Hoàn tất đơn hàng)
export const useSaleOrderComplete = createMutationHook(
  "saleOrderListCurrentDealer",
  `${BASE_URL}/completed`
);

//  DELETE /sale-order/{id}
// (Hủy đơn hàng)
export const useSaleOrderDelete = deleteMutationHook(
  "saleOrderListCurrentDealer",
  BASE_URL
);

//  POST /sale-order
// (Tạo mới đơn hàng)
export const useSaleOrderCreate = createMutationHook(
  "saleOrderListCurrentDealer",
  BASE_URL
);

//  PUT /sale-order/{id}
// (Cập nhật đơn hàng)
export const useSaleOrderUpdate = updateMutationHook(
  "saleOrderListCurrentDealer",
  BASE_URL
);
