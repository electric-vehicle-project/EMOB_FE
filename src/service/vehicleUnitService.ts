import { createQueryHook } from "../hook/useApi";
import api from "../config/api";

// ✅ Hook chính — tách riêng cache theo vehicleId
export const useVehicleUnitList = (
  vehicleId?: string,
  options?: { params?: { page: number; size: number } }
) =>
  createQueryHook(
    `vehicleUnitList-${vehicleId ?? "all"}`,
    "/vehicle/unit/view-all"
  )(options);

// ✅ Lấy chi tiết 1 vehicle unit theo ID
export const useVehicleUnitById = async (vehicleUnitId: string) => {
  const res = await api.get(`/vehicle/unit/${vehicleUnitId}`);
  return res.data?.result;
};
