import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook
} from "../hook/useApi";

// ===============================
// QUERY HOOKS
// ===============================

// Hãng xe xem tất cả hợp đồng của các đại lý
export const useContractQueryByEVM = createQueryHook(
  "contractsByEVM",
  "/contract/dealers"
);

// Đại lý xem hợp đồng của tất cả khách hàng của mình (qua báo giá)
export const useContractQueryByDealer = createQueryHook(
  "contractsByDealer",
  "/contract/dealer/customers"
);

// Đại lý xem hợp đồng của khách hàng cụ thể
export const useContractQueryByCustomer = createQueryWithPathParamHook(
  "contractsByCustomer",
  "/contract/customers"
);

// Đại lý xem hợp đồng của chính mình
export const useContractQueryByCurrentDealer = createQueryHook(
  "contractsByCurrentDealer",
  "/contract/current-dealer"
);

// Lấy chi tiết 1 hợp đồng theo contractId
export const useContractDetailQuery = createQueryWithPathParamHook(
  "contractDetail",
  "/contract"
);

// ===============================
// MUTATION HOOKS
// ===============================
export const useContractSignMutation = createMutationHook("contract", "/contract/sign"); 

export const useContractDeleteMutation = createMutationHook("contract", "/contract/delete");