import {
  createQueryHook,
  createQueryWithPathParamHook,
  updateMutationHook,
} from "../hook/useApi";

const BASE_URL = "/dealer-point-rules";

// ✅ GET /dealer-point-rules (Admin, EVM_STAFF)
export const useDealerPointRuleList = () =>
  createQueryHook("dealerPointRuleList", BASE_URL)();

// ✅ GET /dealer-point-rules/{dealerId} (Manager, DealerStaff)
export const useDealerPointRuleByDealerId = createQueryWithPathParamHook(
  "dealerPointRuleByDealerId",
  BASE_URL
);

// ✅ PUT /dealer-point-rules (Manager update toàn bộ rule cho đại lý)
export const useDealerPointRuleUpdate = updateMutationHook(
  "dealerPointRuleList",
  BASE_URL
);
