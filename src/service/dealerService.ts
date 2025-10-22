// src/service/dealerService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/dealer";

// 🟢 Wrap lại để chuẩn hóa data: chỉ lấy result.data ra
export const useGetDealers = () => {
  const query = createQueryHook("dealers", BASE_URL)();
  // Nếu dữ liệu tồn tại → bóc đúng tầng data
  const dealers = query.data?.result?.data ?? [];
  return { ...query, data: dealers };
};

export const useGetDealerById = createQueryWithPathParamHook(
  "dealer",
  BASE_URL
);

export const useCreateDealer = createMutationHook("dealers", BASE_URL);
export const useUpdateDealer = updateMutationHook("dealers", BASE_URL);
export const useDeleteDealer = deleteMutationHook("dealers", BASE_URL);
