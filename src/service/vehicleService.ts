import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
  createMutationUploadFilesHook,
} from "../hook/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../config/api";

const BASE_URL = "/vehicle";

/* =====================================================
 🧩 QUẢN LÝ XE ĐIỆN
===================================================== */

// 🔍 Lấy toàn bộ danh sách xe điện
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

// 🗑️ Xóa xe điện (soft delete flag true)
export const useDeleteVehicle = deleteMutationHook("vehicles", BASE_URL);

// 💰 Cập nhật giá nhập / giá bán (chuẩn useApi + đúng endpoint Swagger)
export const useUpdateVehiclePrices = () => {
  // Giữ pattern của nhóm (có thể dùng baseHook nếu sau này mở rộng)

  const queryClient = useQueryClient();

  return useMutation({
    // ✅ Endpoint đúng format: /vehicle/{id}/prices
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, number>;
    }) => {
      const res = await api.put(`${BASE_URL}/${id}/prices`, data);
      return res.data;
    },
    onSuccess: () => {
      // ✅ Làm mới lại cache sau khi cập nhật
      queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

// 📦 Tạo hàng loạt Vehicle Units (Bulk)
export const useBulkCreateVehicleUnits = createMutationHook(
  "vehicleUnitsBulk",
  `${BASE_URL}/bulk`
);

// 🔍 Lấy danh sách Vehicle Units theo ID xe
export const useGetVehicleUnitsByVehicleId = createQueryWithPathParamHook(
  "vehicleUnits",
  `${BASE_URL}`
);

// 📤 Upload hình ảnh xe
export const useUploadVehicleImages = createMutationUploadFilesHook(
  "vehicleUpload",
  `${BASE_URL}/upload`
);
