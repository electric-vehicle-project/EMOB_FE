import {
  createMutationHook,
  createQueryHook,
  createQueryWithPathParamHook,
  deleteMutationHook,
  updateMutationHook,
} from "../hook/useApi";

// =================== BASE URL ===================
const BASE_URL = "/vehicle-requests";

// =================== QUERIES ===================

// (GET /vehicle-requests)
export const useGetVehicleRequests = createQueryHook(
  "vehicleRequests",
  BASE_URL
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
