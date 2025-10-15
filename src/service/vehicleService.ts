import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/vehicle";

/**
 * =============================
 * 🚗 VEHICLE (MẪU XE ĐIỆN)
 * =============================
 */

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

// Xoá xe điện
export const useDeleteVehicle = deleteMutationHook("vehicles", BASE_URL);

/**
 * =============================
 * 💰 GIÁ XE (ADMIN)
 * =============================
 * PUT /api/vehicle/{id}/prices
 */
export const useUpdateVehiclePrices = updateMutationHook(
  "vehiclePrices",
  `${BASE_URL}`
);

/**
 * =============================
 * 📦 VEHICLE UNITS (ĐƠN VỊ XE NHẬP KHO)
 * =============================
 */

// Tạo hàng loạt Vehicle Units (Bulk)
export const useBulkCreateVehicleUnits = createMutationHook(
  "vehicleUnitsBulk",
  `${BASE_URL}/bulk`
);

// Lấy danh sách các Vehicle Units của 1 mẫu xe cụ thể
export const useGetVehicleUnitsByVehicleId = createQueryWithPathParamHook(
  "vehicleUnits",
  `${BASE_URL}`
);
