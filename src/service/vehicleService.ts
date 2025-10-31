// ==================================
// EMOB 2025 - Vehicle Service
// Sử dụng useApi.ts, không sửa useApi.ts
// ==================================
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
  createMutationUploadFilesHook,
} from "../hook/useApi";

const BASE_URL = "/vehicle";
const UNIT_URL = "/vehicle/unit";

// ==================================
// 🧩 Lấy danh sách mẫu xe
// GET /api/vehicle
// ==================================
export const useGetVehicles = (params?: any, options?: any) => {
  const hook = createQueryHook("get-vehicles", BASE_URL);
  const query = hook(options, params);

  // 👉 unwrap thủ công: BE trả { code, message, result: { data, metadata } }
  const vehicles =
    (query.data?.result?.data as any[]) || (query.data?.data as any[]) || [];
  const metadata = query.data?.result?.metadata || query.data?.metadata;

  return { ...query, vehicles, metadata };
};

// ==================================
// 🧩 Lấy chi tiết xe
// GET /api/vehicle/{id}
// ==================================
export const useGetVehicleById = (id?: string, options?: any) => {
  const hook = createQueryWithPathParamHook("get-vehicle-by-id", BASE_URL);
  const query = hook(id, options);
  const vehicle = query.data?.result || query.data;
  return { ...query, vehicle };
};

// ==================================
// 🧩 Tạo mẫu xe mới
// POST /api/vehicle
// ==================================
export const useCreateVehicle = () =>
  createMutationHook("create-vehicle", BASE_URL)();

// ==================================
// 🧩 Cập nhật mẫu xe
// PUT /api/vehicle/{id}
// ==================================
export const useUpdateVehicle = () =>
  updateMutationHook("update-vehicle", BASE_URL)();

// ==================================
// 🧩 Xóa mẫu xe
// DELETE /api/vehicle/{id}
// ==================================
export const useDeleteVehicle = () =>
  deleteMutationHook("delete-vehicle", BASE_URL)();

// ==================================
// 🧩 Cập nhật giá (Admin)
// PUT /api/vehicle/{id}/prices
// ==================================
export const useUpdateVehiclePrices = () =>
  updateMutationHook("update-vehicle-prices", `${BASE_URL}`)();

// ==================================
// 🧩 Upload ảnh mẫu xe
// POST /api/vehicle/images
// ==================================
export const useUploadVehicleImages = () =>
  createMutationUploadFilesHook(
    "upload-vehicle-images",
    `${BASE_URL}/images`
  )();

// ==================================
// 🧩 Tạo hàng loạt Vehicle Unit theo model
// POST /api/vehicle/bulk
// ==================================
export const useBulkCreateVehicleUnits = () =>
  createMutationHook("bulk-create-vehicle-units", `${BASE_URL}/bulk`)();

// ==================================
// 🧩 Lấy danh sách Unit theo modelId
// GET /api/vehicle/unit/view-all-by-model/{modelId}
// ==================================
export const useGetVehicleUnitsByVehicleId = (
  modelId?: string,
  options?: any
) => {
  const hook = createQueryWithPathParamHook(
    "get-vehicle-units-by-model",
    `${UNIT_URL}/view-all-by-model`
  );
  const query = hook(modelId, options);

  const units =
    (query.data?.result?.data as any[]) || (query.data?.data as any[]) || [];
  const metadata = query.data?.result?.metadata || query.data?.metadata;

  return { ...query, units, metadata };
};

// ==================================
// 🧩 Lấy tất cả các unit
// GET /api/vehicle/unit/view-all
// ==================================
export const useGetAllVehicleUnits = (params?: any, options?: any) => {
  const hook = createQueryHook("get-all-vehicle-units", `${UNIT_URL}/view-all`);
  const query = hook(options, params);

  const units =
    (query.data?.result?.data as any[]) || (query.data?.data as any[]) || [];
  const metadata = query.data?.result?.metadata || query.data?.metadata;

  return { ...query, units, metadata };
};
