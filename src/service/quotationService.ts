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

export const useQuotationsList = (page = 0, size = 10) => {
  return createQueryHook(["quotations", page, size], BASE_URL)(
    {},
    { page, size }
  );
};

export const useApproveQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any, // response type
    AxiosError<{ message: string }>, // error type
    { id: string; data: any; paymentStatus: string } // variables type
  >({
    mutationFn: async ({ id, data, paymentStatus }) => {
      // ✅ Đúng định dạng backend yêu cầu
      return (
        await api.put(`/quotation/${id}/approved`, data, {
          params: { paymentStatus },
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotationDetail"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};
