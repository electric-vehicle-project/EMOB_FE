import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

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
// COMPLETE ORDER (DEALER_STAFF, EVM_STAFF)
// POST /sale-order/complete/{id}
// ==========================
export const useSaleOrderComplete = createMutationHook(
  "saleOrderComplete",
  `${BASE_URL}/complete`
);

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
