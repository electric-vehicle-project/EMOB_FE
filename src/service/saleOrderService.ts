// src/service/saleOrderService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/sale-order";

export const useSaleOrdersOfCurrentDealer = (
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook("saleOrdersCurrentDealer", `${BASE_URL}/current-dealer`)(
    options,
    params
  );

export const useSalesByStaffSummary = (
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook("salesByStaffSummary", `${BASE_URL}/sale-of-staff`)(
    options,
    params
  );

export const useSaleOrdersByCustomerId = (
  customerId: string,
  options?: Record<string, any>,
  params?: Record<string, any>
) =>
  createQueryHook(
    "saleOrdersByCustomer",
    `${BASE_URL}/customers/${customerId}`
  )(options, params);

export const useSaleOrderById = createQueryWithPathParamHook(
  "saleOrderDetail",
  BASE_URL
);

export const useSaleOrderComplete = createMutationHook(
  "saleOrderComplete",
  `${BASE_URL}/complete`
);

export const useSaleOrderDelete = deleteMutationHook(
  "saleOrderDelete",
  BASE_URL
);

export const useSaleOrderCreate = createMutationHook(
  "saleOrderCreate",
  BASE_URL
);
