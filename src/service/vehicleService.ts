import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/vehicle";

// Lấy toàn bộ danh sách xe điện
export const useGetVehicles = createQueryHook("vehicles", BASE_URL);

// Lấy chi tiết 1 xe điện theo ID
export const useGetVehicleById = createQueryWithPathParamHook(
  "vehicle",
  BASE_URL
);

// Tạo mới xe điện
export const useCreateVehicle = createMutationHook("vehicles", BASE_URL);

// Cập nhật thông tin xe điện
export const useUpdateVehicle = updateMutationHook("vehicles", BASE_URL);

// ✅ Xóa xe điện (soft delete flag true)
export const useDeleteVehicle = deleteMutationHook("vehicles", BASE_URL);

// Cập nhật giá nhập / giá bán (chỉ Admin)
export const useUpdateVehiclePrices = updateMutationHook(
  "vehiclePrices",
  `${BASE_URL}`
);

// Tạo hàng loạt Vehicle Units (Bulk)
export const useBulkCreateVehicleUnits = createMutationHook(
  "vehicleUnitsBulk",
  `${BASE_URL}/bulk`
);

// Lấy danh sách Vehicle Units theo ID
export const useGetVehicleUnitsByVehicleId = createQueryWithPathParamHook(
  "vehicleUnits",
  `${BASE_URL}`
);
