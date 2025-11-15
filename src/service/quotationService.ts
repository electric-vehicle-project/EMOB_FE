import type { AxiosError } from "axios";
import {
  createMutationHook,
  createQueryHook,
  createQueryWithPathParamHook,
  deleteMutationHook,
  updateMutationHook,
} from "../hook/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../config/api";

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

export const useGetQuotationById = createQueryWithPathParamHook(
  "quotationDetail",
  BASE_URL
);

// get-all
export const useQuotationsList = (params?: {
  page?: number;
  size?: number;
  search?: string;
  statuses?: string[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) => {
  return createQueryHook("quotations", "/quotation")(
    {},
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      search: params?.search ?? "",
      status: params?.statuses?.length ? params.statuses.join(",") : undefined,
      sortField: params?.sortField ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    }
  );
};

interface ApproveQuotationPayload {
  id: string;
  data: {
    itemsId: string;
    vehicleId: string;
    promotionId?: string | null;
    quantity: number;
  }[];
  paymentStatus?: "FULL" | "INSTALLMENT";
}

interface ApproveQuotationResponse {
  success?: boolean;
  message: string;
  result?: any;
}

// PUT: approve quotation
export const useApproveQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApproveQuotationResponse,
    AxiosError<{ message: string }>,
    ApproveQuotationPayload
  >({
    mutationFn: async ({ id, data, paymentStatus }) => {
      console.log("Payload gửi đi:", data);

      const response = await api.put(`/quotation/${id}/approved`, data, {
        params: paymentStatus ? { paymentStatus } : undefined,
      });

      return response.data;
    },

    onSuccess: (data, variables) => {
      console.log("Approve success:", data);

      // Làm mới cache
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({
        queryKey: ["quotationDetail", variables.id],
      });
    },

    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        "Không thể duyệt báo giá — vui lòng thử lại.";
      console.error("Approve failed:", msg);
    },
  });
};

export const useRejectQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<{ message: string }>, string>({
    mutationFn: async (id: string) =>
      (await api.put(`/quotation/${id}/reject`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotationDetail"] });
    },
  });
};
