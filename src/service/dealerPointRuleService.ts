import { createQueryHook, createQueryWithPathParamHook } from "../hook/useApi";

const BASE_URL = "/dealer-point-rules";

// GET all (Admin + EVM)
export const useDealerPointRuleList = () =>
  createQueryHook("dealerPointRuleList", BASE_URL)();

// GET by dealer
export const useDealerPointRuleByDealerId = createQueryWithPathParamHook(
  "dealerPointRuleByDealerId",
  BASE_URL
);

// Không export mutation cho PUT vì BE không có /:id
