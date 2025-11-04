// src/service/vehicleService.ts
import { createQueryHook, createMutationHook } from "../hook/useApi";
import api from "../config/api";

const BASE_URL = "/vehicle";

// ✅ Lấy danh sách units theo vehicleId
export const useVehicleUnitList = (
  vehicleId?: string,
  options?: { params?: { page: number; size: number } }
) =>
  createQueryHook(
    `vehicleUnitList-${vehicleId ?? "all"}`,
    "/vehicle/unit/view-all"
  )(options);

// ✅ Lấy chi tiết 1 vehicle unit
export const useVehicleUnitById = async (vehicleUnitId: string) => {
  const res = await api.get(`/vehicle/unit/${vehicleUnitId}`);
  return res.data?.result;
};

// ✅ NEW: Tạo hàng loạt units cho 1 vehicle (chuẩn Swagger /api/vehicle/bulk)
export const useCreateVehicleUnitsBulk = () =>
  createMutationHook("vehicleUnitBulk", `${BASE_URL}/bulk`)();
