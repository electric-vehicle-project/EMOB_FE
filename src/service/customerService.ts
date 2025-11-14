import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/customers";

// GET /customers?page=&size=&keyword=&status=&sortField=&sortDir=
export const useCustomerList = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) =>
  createQueryHook("customerList", BASE_URL)(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      keyword: params?.keyword ?? "",
      status: params?.status, // truyền thẳng array
      sortField: params?.sortField ?? "fullName",
      sortDir: params?.sortDir ?? "desc",
    }
  );

// GET /customers/{id}
export const useCustomerById = createQueryWithPathParamHook(
  "customerDetail",
  BASE_URL
);

// POST /customers   (invalidate list)
export const useCustomerCreate = createMutationHook("customerList", BASE_URL);

// PUT /customers/{id}   (invalidate list)
export const useCustomerUpdate = updateMutationHook("customerList", BASE_URL);

// DELETE /customers/{id}   (invalidate list)
export const useCustomerDelete = deleteMutationHook("customerList", BASE_URL);
