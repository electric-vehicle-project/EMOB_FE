// ==================================
// EMOB 2025 - Vehicle Service (useApi standardized)
// ==================================
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
  createMutationUploadFilesHook,
} from "../hook/useApi";

// ==================================
// BASE URLS (theo Swagger backend chuẩn)
// ==================================
const BASE_VEHICLE_URL = "/vehicle";
export const BASE_UNIT_URL = "/vehicle/unit";

// ==================================
// 🔹 GET ALL ELECTRIC VEHICLES
// GET /api/vehicle?page=0&size=10&sortField=createdAt&sortDir=desc
// ==================================
export const useGetVehicles = createQueryHook("get-vehicles", BASE_VEHICLE_URL);

// ==================================
// 🔹 GET VEHICLE BY ID
// GET /api/vehicle/{id}
// ==================================
export const useGetVehicleById = createQueryWithPathParamHook(
  "get-vehicle-by-id",
  BASE_VEHICLE_URL
);

// ==================================
// 🔹 CREATE VEHICLE
// POST /api/vehicle
// ==================================
export const useCreateVehicle = createMutationHook(
  "get-vehicles",
  BASE_VEHICLE_URL
);

// ==================================
// 🔹 UPDATE VEHICLE
// PUT /api/vehicle/{id}
// ==================================
export const useUpdateVehicle = updateMutationHook(
  "get-vehicles",
  BASE_VEHICLE_URL
);

// ==================================
// 🔹 DELETE VEHICLE
// DELETE /api/vehicle/{id}
// ==================================
export const useDeleteVehicle = deleteMutationHook(
  "get-vehicles",
  BASE_VEHICLE_URL
);

// ==================================
// 🔹 UPDATE PRICES (ADMIN)
// PUT /api/vehicle/{id}/prices
// ==================================
export const useUpdateVehiclePrices = updateMutationHook(
  "get-vehicle-prices",
  `${BASE_VEHICLE_URL}`
); // gọi useUpdateVehiclePrices(id).mutate({ id, data: { importPrice, retailPrice } })

// ==================================
// 🔹 BULK CREATE VEHICLE UNITS
// POST /api/vehicle/bulk
// ==================================
export const useBulkCreateVehicleUnits = createMutationHook(
  "bulk-create-vehicle-units",
  `${BASE_VEHICLE_URL}/bulk`
);

// ==================================
// 🔹 GET VEHICLE UNITS BY MODEL
// GET /api/vehicle/unit/view-all-by-model/{modelId}?page=&size=
// ==================================
export const useGetVehicleUnitsByVehicleId = createQueryWithPathParamHook(
  "get-vehicle-units-by-model",
  `${BASE_UNIT_URL}/view-all-by-model`
);

// ==================================
// 🔹 GET SINGLE VEHICLE UNIT
// GET /api/vehicle/unit/{id}
// ==================================
export const useGetVehicleUnitById = createQueryWithPathParamHook(
  "get-vehicle-unit-by-id",
  BASE_UNIT_URL
);

// ==================================
// 🔹 GET ALL VEHICLE UNITS
// GET /api/vehicle/unit/view-all
// ==================================
export const useGetAllVehicleUnits = createQueryHook(
  "get-all-vehicle-units",
  `${BASE_UNIT_URL}/view-all`
);

// ==================================
// 🔹 UPLOAD VEHICLE IMAGES
// POST /api/vehicle/images
// ==================================
export const useUploadVehicleImages = createMutationUploadFilesHook(
  "upload-vehicle-images",
  `${BASE_VEHICLE_URL}/images`
);
