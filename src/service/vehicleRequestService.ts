/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMutationHook,
  createQueryHook,
  createQueryWithPathParamHook,
  deleteMutationHook,
  updateMutationHook,
} from "../hook/useApi";
import type { AxiosError } from "axios";
import api from "../config/api";

// =================== BASE URL ===================
const BASE_URL = "/vehicle-request";

// =================== QUERIES ===================

// (GET /vehicle-requests)
export const useGetVehicleRequests = (params?: {
  page?: number;
  size?: number;
  search?: string;
  statuses?: string[];
  sortField?: string;
  sortDir?: "asc" | "desc";
}) => {
  return createQueryHook("vehicleRequests", BASE_URL)(
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

// (GET /vehicle-requests/{id})
export const useGetVehicleRequestById = createQueryWithPathParamHook(
  "vehicleRequestDetail",
  BASE_URL
);

// (POST /vehicle-requests)
export const useCreateVehicleRequest = createMutationHook(
  "createVehicleRequest",
  BASE_URL
);
export const useCreateVehicleRequestForAdmin = createMutationHook(
  "viewVehicleRequestForAdmin",
  `${BASE_URL}/for-admin`
);

// (PUT /vehicle-requests/{id})
export const useUpdateVehicleRequest = updateMutationHook(
  "updateVehicleRequest",
  BASE_URL
);

// (DELETE /vehicle-requests/{id})
export const useDeleteVehicleRequest = deleteMutationHook(
  "deleteVehicleRequest",
  BASE_URL
);

// Approve
export const useApproveVehicleRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    AxiosError<{ message: string }>,
    { id: string; paymentStatus: string }
  >({
    mutationFn: async ({ id, paymentStatus }) => {
      // PUT /vehicle-request/{id}/approved?id={id}
      return (
        await api.put(`/vehicle-request/${id}/approved`, paymentStatus, {
          params: { id },
          headers: { "Content-Type": "application/json" },
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleRequestDetail"] });
      queryClient.invalidateQueries({ queryKey: ["vehicleRequests"] });
    },
  });
};

// view all for admin
export const useGetVehicleRequestsForAdmin = (params?: {
  keyword?: string;
  statuses?: string[];
  sortField?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}) => {
  const queryParams = {
    keyword: params?.keyword ?? "",
    page: params?.page ?? 0,
    size: params?.size ?? 10,

    status: params?.statuses?.length ? params.statuses.join(",") : undefined,

    sortField: params?.sortField ?? "createdAt",
    sortDir: params?.sortDir ?? "desc",
  };

  return useQuery({
    queryKey: ["vehicleRequestsForAdmin", queryParams],
    queryFn: async () => {
      const response = await api.get("/vehicle-request/for-admin", {
        params: queryParams,
      });
      return response.data;
    },
  });
};
