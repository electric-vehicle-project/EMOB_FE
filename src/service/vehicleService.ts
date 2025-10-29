// /src/service/vehicleService.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import api from "../config/api";
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
  createMutationUploadFilesHook,
} from "../hook/useApi";

const BASE_URL = "/vehicle";

/* =====================================================
 🧩 QUẢN LÝ XE ĐIỆN (bám sát Swagger)
===================================================== */

// 🔍 Lấy danh sách xe điện (factory cũ vẫn dùng được, truyền params ở arg2)
export const useGetVehicles = createQueryHook("vehicles", BASE_URL);

// 🔍 Lấy chi tiết 1 xe điện theo ID
export const useGetVehicleById = createQueryWithPathParamHook(
  "vehicle",
  BASE_URL
);

// ➕ Tạo mới xe điện
export const useCreateVehicle = createMutationHook("vehicles", BASE_URL);

// ✏️ Cập nhật thông tin xe điện
export const useUpdateVehicle = updateMutationHook("vehicles", BASE_URL);

// 🗑️ Xóa xe điện
export const useDeleteVehicle = deleteMutationHook("vehicles", BASE_URL);

// 💰 Cập nhật giá nhập / giá bán: PUT /vehicle/{id}/prices
export const useUpdateVehiclePrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { importPrice: number; retailPrice: number };
    }) => (await api.put(`${BASE_URL}/${id}/prices`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

// 📦 Tạo hàng loạt Vehicle Units (Bulk): POST /vehicle/bulk
export const useBulkCreateVehicleUnits = createMutationHook(
  "vehicleUnitsBulk",
  `${BASE_URL}/bulk`
);

// 🖼️ Upload hình ảnh xe (nếu BE của bạn có endpoint này)
export const useUploadVehicleImages = createMutationUploadFilesHook(
  "vehicleUpload",
  `${BASE_URL}/upload`
);

/**
 * ✅ NEW: Hook chuẩn để phân trang & filter danh sách xe theo Swagger
 * GET /api/vehicle?page&size&keyword&type&sortField&sortDir
 */
export function useGetAllVehicles(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  type?: string[]; // ["SEDAN","SUV",...]
  sortField?: string; // default "createdAt"
  sortDir?: "asc" | "desc"; // default "desc"
}): UseQueryResult<unknown, unknown> {
  const {
    page = 0,
    size = 10,
    keyword,
    type,
    sortField = "createdAt",
    sortDir = "desc",
  } = params ?? {};

  return useQuery({
    queryKey: ["vehicles", page, size, keyword, type, sortField, sortDir],
    queryFn: async () =>
      (
        await api.get(`${BASE_URL}`, {
          params: { page, size, keyword, type, sortField, sortDir },
        })
      ).data,
  });
}

/**
 * ✅ NEW: Lấy Vehicle Units theo **modelId** (đúng theo Swagger)
 * GET /vehicle/unit/view-all-by-model/{modelId}?page&size
 */
export function useGetVehicleUnitsByVehicleId(
  modelId?: string,
  page = 0,
  size = 10
): UseQueryResult<unknown, unknown> {
  return useQuery({
    enabled: !!modelId,
    queryKey: ["vehicleUnitsByModel", modelId, page, size],
    queryFn: async () =>
      (
        await api.get(`${BASE_URL}/unit/view-all-by-model/${modelId}`, {
          params: { page, size },
        })
      ).data,
  });
}
