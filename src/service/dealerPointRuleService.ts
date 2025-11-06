import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
} from "../hook/useApi";

const BASE_URL = "/dealer-point-rules";

// ===== GET all dealer point rules (EVM Staff) =====
export const useDealerPointRules = () => {
  const query = createQueryHook("dealer-point-rules", BASE_URL)();
  const rules = query.data?.result ?? [];
  return { ...query, data: rules };
};

// ===== GET rules by dealerId (Dealer Staff) =====
export const useDealerPointRuleByDealer = createQueryWithPathParamHook(
  "dealer-point-rule-by-dealer",
  BASE_URL
);

// ===== POST create new dealer point rule (EVM Staff) =====
export const useCreateDealerPointRule = createMutationHook(
  "create-dealer-point-rule",
  BASE_URL
);
