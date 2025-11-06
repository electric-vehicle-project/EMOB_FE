import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/customers";

// ======= Lấy danh sách khách hàng (có phân trang) =======
export const useCustomerList = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) => {
  return createQueryHook("customerList", BASE_URL)(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      keyword: params?.keyword ?? "",
      status: params?.status,
      sortField: params?.sortField ?? "fullName",
      sortDir: params?.sortDir ?? "desc",
    }
  );
};

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
