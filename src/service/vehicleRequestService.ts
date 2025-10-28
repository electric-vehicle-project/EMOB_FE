import { useMutation, useQueryClient } from "@tanstack/react-query";
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
export const useGetVehicleRequests = (page = 0, size = 10, search = "") =>
  createQueryHook("vehicleRequests", BASE_URL)(
    {},
    { page, size, search } // 👈 thêm query param search
  );

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
