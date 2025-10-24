import {
  createQueryHook,
  createQueryWithPathParamHook,
  updateMutationHook,
} from "../hook/useApi";

// ✅ GET all
export const useGetVehiclePriceRules = createQueryHook(
  "vehiclePriceRules",
  "/vehicle-price-rules"
);

// ✅ GET by status
export const useGetVehiclePriceRuleByStatus = createQueryWithPathParamHook(
  "vehiclePriceRuleByStatus",
  "/vehicle-price-rules"
);

// ✅ PUT update (Admin)
export const usePutVehiclePriceRules = updateMutationHook(
  "vehiclePriceRulesUpdate",
  "/vehicle-price-rules"
);
