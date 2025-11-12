// src/service/installmentPlanService.ts
import { createQueryHook } from "../hook/useApi";

// ===============================
// 🔹 QUERY HOOKS (GET)
// ===============================

// GET all installment plans (params: page, size, keyword, sortField, sortDir)
export const useInstallmentPlansQuery = createQueryHook(
  "installmentPlans",
  "/installment/dealers"
);

export const useCurrentDealerInstallmentPlansQuery = createQueryHook(
  "currentDealerInstallmentPlans",
  "/installment/current-dealer"
);

export const useInstallmetnPlanByCustomersQuery = createQueryHook(
  "currentDealerInstallmentPlans",
  "/installment/by-customer"
);
