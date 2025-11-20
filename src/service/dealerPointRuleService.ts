import {
  createQueryHook,
  createQueryWithPathParamHook,
  updateMutationHook,
} from "../hook/useApi";

const BASE_URL = "/dealer-point-rules";

// GET all (Admin, EVM_STAFF)
export const useDealerPointRuleList = createQueryHook(
  "dealerPointRuleList",
  BASE_URL
);

// GET by dealerId (Manager, DealerStaff)
export const useDealerPointRuleByDealerId = createQueryWithPathParamHook(
  "dealerPointRuleByDealerId",
  BASE_URL
);

// PUT update toàn bộ rule cho 1 dealer (body = array)
export const useDealerPointRuleUpdate = updateMutationHook(
  "dealerPointRuleUpdate",
  BASE_URL
);
