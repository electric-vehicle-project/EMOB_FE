import { createMutationHook, createQueryHook } from "../hook/useApi";

const BASE_URL = "/dealer-discount-policy";

export const useCreateDealerDiscountPolicy = createMutationHook(
  "createDealerDiscountPolicy",
  BASE_URL
);
