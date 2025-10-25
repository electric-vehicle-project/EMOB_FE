import {
  createMutationHook,
  createQueryHook,
  createQueryWithPathParamHook,
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

export const useApproveQuotation = updateMutationHook(
  "approveQuotation",
  `${BASE_URL}/approved`
);
