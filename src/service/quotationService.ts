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

// Hook mới - dùng cho query param
// export const createQueryWithQueryParamHook =
//   (queryKey: string, url: string) => (id?: string, options?: any) => {
//     return useQuery({
//       queryKey: id ? [queryKey, id] : [queryKey],
//       queryFn: async () => {
//         if (!id) throw new Error("ID is required");
//         return (await api.get(url, { params: { id } })).data; // Query param
//       },
//       enabled: !!id,
//       ...options,
//     });
//   };

export const useGetQuotationById = createQueryWithPathParamHook(
  "quotationDetail",
  BASE_URL
);

export const useQuotationsList = (page = 0, size = 10, search = "") => {
  return createQueryHook(["quotations", page, size, search], "/quotation")(
    {},
    { page, size, search }
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
