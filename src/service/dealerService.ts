// src/service/dealerService.ts
import {
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
  createQueryHook,
} from "../hook/useApi";

// ===============================
// 🔹 QUERY HOOKS (GET)
// ===============================
const BASE_URL = "/dealer";
// GET all dealers (params: page, size, keyword, country, sortField, sortDir, region)
export const useDealersQuery = (
  page: number = 0,
  size: number = 10,
  keyword: string = "",
  sortField: string = "createdAt",
  sortDir: "asc" | "desc" = "desc",
  country?: string,
  regions?: string[], // NORTH | CENTRAL | SOUTH
  enabled: boolean = true
) => {
  return createQueryHook("dealers", BASE_URL)(
    { enabled },
    {
      page,
      size,
      keyword: keyword || undefined,
      sortField,
      sortDir,
      country: country || undefined,
      regions: regions && regions.length > 0 ? regions : undefined, // ← thêm CHUẨN Swagger
    }
  );
};
// GET dealer by ID
export const useDealerByIdQuery = createQueryWithPathParamHook(
  "dealerById",
  "/dealer"
);

// (Các report để nguyên nếu cần dùng sau)
export const useDealerRevenueByIdQuery = createQueryWithPathParamHook(
  "dealerRevenueById",
  "/dealer"
);

export const useCustomerRevenueByIdQuery = createQueryWithPathParamHook(
  "customerRevenueById",
  "/dealer"
);

export const useDealerRevenueQuery = createQueryHook(
  "dealerRevenue",
  "/dealer/dealer-revenue"
);

export const useCustomerRevenueQuery = createQueryHook(
  "customerRevenue",
  "/dealer/customer-revenue"
);

// ===============================
// 🔹 MUTATION HOOKS (POST / PUT / DELETE)
// ===============================

// POST create dealer
export const useCreateDealerMutation = createMutationHook("dealers", "/dealer");

// PUT update dealer by ID
export const useUpdateDealerMutation = updateMutationHook("dealers", "/dealer");

// DELETE dealer by ID
export const useDeleteDealerMutation = deleteMutationHook("dealers", "/dealer");
