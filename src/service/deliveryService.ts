// src/service/deliveryService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
} from "../hook/useApi";

// ===============================
// QUERY HOOKS
// ===============================

// EVM xem tất cả yêu cầu giao hàng từ các đại lý
export const useDeliveryQueryByEVM = createQueryHook(
  "deliveriesByEVM",
  "/delivery/dealers"
);

// Đại lý xem các yêu cầu giao hàng của chính mình (gửi cho EVM)
export const useDeliveryQueryByCurrentDealer = createQueryHook(
  "deliveriesByCurrentDealer",
  "/delivery/dealer/current"
);

// Đại lý xem các giao hàng đến khách hàng cuối
export const useDeliveryQueryByCustomers = createQueryHook(
  "deliveriesByCustomers",
  "/delivery/customers"
);

// Đại lý xem danh sách giao hàng theo 1 khách hàng cụ thể
export const useDeliveryQueryByCustomer = createQueryWithPathParamHook(
  "deliveriesByCustomer",
  "/delivery/customer"
);

// Lấy chi tiết một giao hàng cụ thể theo deliveryId
export const useDeliveryDetailQuery = createQueryWithPathParamHook(
  "deliveryDetail",
  "/delivery"
);

// ===============================
// MUTATION HOOKS
// ===============================

export const useDeliveryCreateByDealerMutation = createMutationHook(
  "deliveryDealer",
  "/delivery/dealer"
);

export const useDeliveryCreateByCustomerMutation = createMutationHook(
  "deliveryCustomer",
  "/delivery/customer"
);

export const useDeliveryDeleteMutation = createMutationHook(
  "deliveryDelete",
  "/delivery"
);

// ===============================
// CUSTOM MUTATION HOOKS
// ===============================

import  api from "../config/api";
import { useMutation } from "@tanstack/react-query";
import { message } from "antd";

// Hoàn tất giao hàng
export const useDeliveryCompleteMutation = () =>
  useMutation({
    mutationFn: async (deliveryId: string) => {
      const { data } = await api.put(`/delivery/${deliveryId}/complete`);
      return data;
    },
    onSuccess: () => message.success("Đã hoàn tất giao hàng thành công."),
    onError: () => message.error("Không thể hoàn tất giao hàng."),
  });
