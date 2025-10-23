// src/service/dealerService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/dealer";

export const useGetDealers = createQueryHook("dealers", BASE_URL);

export const useGetDealerById = createQueryWithPathParamHook(
  "dealer",
  BASE_URL
);

export const useCreateDealer = createMutationHook("dealers", BASE_URL);

export const useUpdateDealer = updateMutationHook("dealers", BASE_URL);

export const useDeleteDealer = deleteMutationHook("dealers", BASE_URL);
