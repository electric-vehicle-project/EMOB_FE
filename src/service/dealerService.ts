// src/service/dealerService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

// ===============================
// 🔹 QUERY HOOKS (GET)
// ===============================

// GET all dealers (params: page, size, keyword, country, sortField, sortDir)
export const useDealersQuery = createQueryHook("dealers", "/dealer");

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
