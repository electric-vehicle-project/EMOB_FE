// src/service/dealerService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/dealer";

//  GET: Lấy toàn bộ đại lý
export const useGetDealers = createQueryHook("dealers", BASE_URL);

//  GET: Lấy đại lý theo ID
export const useGetDealerById = createQueryWithPathParamHook("dealer", BASE_URL);

//  POST: Tạo mới đại lý
export const useCreateDealer = createMutationHook("dealers", BASE_URL);

//  PUT: Cập nhật đại lý
export const useUpdateDealer = updateMutationHook("dealers", BASE_URL);

//  DELETE: Xóa đại lý
export const useDeleteDealer = deleteMutationHook("dealers", BASE_URL);
