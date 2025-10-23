import {
  createMutationHook,
  createQueryHook,
  deleteMutationHook,
  updateMutationHook,
} from "../hook/useApi";

const BASE_URL = "/quotation";

export const useCreateQuotation = createMutationHook(
  "createQuotation",
  BASE_URL
);
export const useUpdateQuotation = updateMutationHook(
  "updateQuotation",
  BASE_URL
);
export const useDeleteQuotation = deleteMutationHook(
  "deleteQuotation",
  BASE_URL
);

export const useQuotationsList = (page = 0, size = 10) =>
  createQueryHook("customerList", BASE_URL)({}, { page, size });
