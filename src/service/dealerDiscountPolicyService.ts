import { useMutation } from "@tanstack/react-query";
import {
  createMutationHook,
  createQueryHook,
  createQueryWithPathParamHook,
  deleteMutationHook,
  updateMutationHook,
} from "../hook/useApi";
import api from "../config/api";
import { toast } from "react-toastify";

const BASE_URL = "/dealer-discount-policy";
const BASE_DEALER_URL = "/dealer";

export const useGetDiscountPolicyById = createQueryWithPathParamHook(
  "discountPolicyDetail",
  BASE_URL
);

// get-all
export const useGetAllDealerDiscountPolicies = (
  page = 0,
  size = 20,
  search = "",
  status: string[] = [],
  sortField = "effectiveDate",
  sortDir: "asc" | "desc" = "desc"
) => {
  return createQueryHook("dealerDiscountPolicies", BASE_URL)(
    {},
    {
      page,
      size,
      search,
      status: status.length ? status.join(",") : undefined,
      sortField,
      sortDir,
    }
  );
};

// get-all-by-dealer
export const useGetAllDealerDiscountPoliciesByDealer = (
  page = 0,
  size = 20,
  search = "",
  status: string[] = [],
  sortField = "effectiveDate",
  sortDir: "asc" | "desc" = "desc"
) => {
  return createQueryHook(
    "dealerDiscountPoliciesByDealer",
    `${BASE_URL}/by-dealer`
  )(
    {},
    {
      page,
      size,
      search,
      status: status.length ? status.join(",") : undefined,
      sortField,
      sortDir,
    }
  );
};

// CREATE
export const useCreateBulkDiscountPolicy = createMutationHook(
  "allDealerDiscountPolicies",
  `${BASE_URL}/bulk-create`
);

// UPDATE
export const useUpdateDiscountPolicy = updateMutationHook(
  "discountPolicies",
  BASE_URL
);

// DELETE
export const useDeleteDiscountPolicy = deleteMutationHook(
  "dealerDiscountPolicies",
  BASE_URL
);

// getAllDealers
export const useGetAllDealers = (
  page: number = 0,
  size: number = 20,
  search: string = ""
) => {
  return createQueryHook(
    "dealers", // queryKey phải là string
    BASE_DEALER_URL
  )(
    {},
    {
      page,
      size,
      search,
    }
  );
};

// update bulk

export const useBulkUpdateDiscountPolicies = () => {
  return useMutation({
    mutationFn: async (payload: {
      dealerIds: string[];
      vehicleModelIds: string[];
      customMultiplier: number;
      finalPrice: number;
      effectiveDate: string;
      expiredDate: string;
    }) => {
      const { data } = await api.put(
        `/dealer-discount-policy/bulk-update`,
        payload
      );
      return data;
    },
    onSuccess: () => toast.success("✅ Cập nhật hàng loạt thành công!"),
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || " Cập nhật thất bại!"),
  });
};

// Bulk delete Dealer Discount Policies by status
export const useBulkDeleteDiscountPolicies = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(
        "/dealer-discount-policy/bulk-delete",
        payload
      );
      return data;
    },
  });
};
