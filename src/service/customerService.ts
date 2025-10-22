// src/service/customerService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/customers";

// ======= Lấy danh sách khách hàng (có phân trang) =======
export const useCustomerList = (page = 0, size = 10) =>
  createQueryHook("customerList", BASE_URL)({}, { page, size });

// ======= Lấy chi tiết khách hàng theo ID =======
export const useCustomerById = createQueryWithPathParamHook(
  "customerDetail",
  BASE_URL
);

// ======= Tạo mới khách hàng =======
export const useCustomerCreate = createMutationHook("customerCreate", BASE_URL);

// ======= Cập nhật khách hàng =======
export const useCustomerUpdate = updateMutationHook("customerUpdate", BASE_URL);

// ======= Xoá khách hàng =======
export const useCustomerDelete = deleteMutationHook("customerDelete", BASE_URL);
