import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../config/api";

const BASE_URL = "/sale-order";

// ==========================
// GET LIST - current dealer (MANAGER)
// ==========================
export const useSaleOrdersOfCurrentDealer = (
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook("saleOrdersCurrentDealer", `${BASE_URL}/current-dealer`)(
    options,
    params
  );

// ==========================
// GET LIST - current staff (DEALER_STAFF)
// ==========================
export const useSaleOrdersOfCurrentStaff = (
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook("saleOrdersCurrentStaff", `${BASE_URL}/staff/current`)(
    options,
    params
  );

// ==========================
// GET LIST - all dealers (EVM)
// ==========================
export const useSaleOrdersOfDealers = (
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook("saleOrdersOfDealers", `${BASE_URL}/dealers`)(
    options,
    params
  );

// ==========================
// GET SUMMARY BY STAFF (MANAGER)
// ==========================
export const useSalesByStaffSummary = (
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook("salesByStaffSummary", `${BASE_URL}/sale-of-staff`)(
    options,
    params
  );

// ==========================
// GET LIST - by customerId (MANAGER, DEALER_STAFF)
// ==========================
export const useSaleOrdersByCustomerId = (
  customerId: string,
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook(
    "saleOrdersByCustomer",
    `${BASE_URL}/customers/${customerId}`
  )(options, params);

// ==========================
// GET DETAIL - by orderId (ALL ROLES ALLOWED)
// ==========================
export const useSaleOrderById = createQueryWithPathParamHook(
  "saleOrderDetail",
  BASE_URL
);

// ==========================
// ✅ COMPLETE ORDER (DEALER_STAFF, EVM_STAFF)
// POST /sale-order/{id}/completed
// ==========================
export const useSaleOrderComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`${BASE_URL}/${id}/completed`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saleOrdersCurrentDealer"] });
      queryClient.invalidateQueries({ queryKey: ["saleOrdersCurrentStaff"] });
    },
  });
};

// ==========================
// CANCEL ORDER (DEALER_STAFF, EVM_STAFF)
// DELETE /sale-order/{id}
// ==========================
export const useSaleOrderDelete = deleteMutationHook(
  "saleOrderDelete",
  BASE_URL
);

// ==========================
// CREATE ORDER (for future features)
// ==========================
export const useSaleOrderCreate = createMutationHook(
  "saleOrderCreate",
  BASE_URL
);
